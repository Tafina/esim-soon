"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac, randomUUID } from "crypto";

// ============= eSIM Access API Client =============

const API_BASE_URL = process.env.ESIM_API_BASE_URL || "https://api.esimaccess.com";

function generateSignature(
  timestamp: string,
  requestId: string,
  accessCode: string,
  body: string,
  secretKey: string
): string {
  const signData = timestamp + requestId + accessCode + body;
  return createHmac("sha256", secretKey).update(signData).digest("hex").toLowerCase();
}

function getAuthHeaders(body: string): Record<string, string> {
  const accessCode = process.env.ESIM_ACCESS_CODE;
  const secretKey = process.env.ESIM_SECRET_KEY;

  if (!accessCode || !secretKey) {
    throw new Error("Missing ESIM_ACCESS_CODE or ESIM_SECRET_KEY environment variables");
  }

  const timestamp = Date.now().toString();
  const requestId = randomUUID();
  const signature = generateSignature(timestamp, requestId, accessCode, body, secretKey);

  return {
    "Content-Type": "application/json",
    "RT-Timestamp": timestamp,
    "RT-RequestID": requestId,
    "RT-AccessCode": accessCode,
    "RT-Signature": signature,
  };
}

async function apiRequest<T>(endpoint: string, body: object): Promise<T> {
  const bodyString = JSON.stringify(body);
  const headers = getAuthHeaders(bodyString);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: bodyString,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errorCode && data.errorCode !== "0") {
    throw new Error(`API error: ${data.errorCode} - ${data.errorMsg || "Unknown error"}`);
  }

  return data;
}

interface ESimProfile {
  iccid: string;
  imsi?: string;
  ac: string;
  qrCodeUrl?: string;
  smdpAddress?: string;
  esimStatus: string;
  smdpStatus?: string;
  orderNo: string;
  totalVolume: number;
  orderUsage?: number;
  expiredTime?: string;
  activeType?: string;
  eid?: string;
  packageList?: Array<{
    packageCode: string;
    duration: number;
    volume: number;
    locationCode?: string;
  }>;
}

interface OrderResponse {
  errorCode: string;
  errorMsg?: string;
  obj: {
    orderNo: string;
  };
}

interface QueryResponse {
  errorCode: string;
  errorMsg?: string;
  obj: {
    esimList?: ESimProfile[];
    eSimList?: ESimProfile[];
    total?: number;
  };
}

async function orderEsim(params: {
  transactionId: string;
  amount: number;
  packageInfoList: Array<{
    packageCode: string;
    count: number;
    price: number;
  }>;
}): Promise<string> {
  const response = await apiRequest<OrderResponse>("/api/v1/open/esim/order", params);
  return response.obj.orderNo;
}

async function queryEsims(params: {
  orderNo?: string;
  iccid?: string;
}): Promise<ESimProfile[]> {
  const bodyString = JSON.stringify({
    ...params,
    pager: {
      pageNum: 1,
      pageSize: 100,
    },
  });
  const headers = getAuthHeaders(bodyString);

  const response = await fetch(`${API_BASE_URL}/api/v1/open/esim/query`, {
    method: "POST",
    headers,
    body: bodyString,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Error 200010 means eSIMs are still being provisioned - return empty array
  if (data.errorCode === "200010") {
    return [];
  }

  if (data.errorCode && data.errorCode !== "0") {
    throw new Error(`API error: ${data.errorCode} - ${data.errorMsg || "Unknown error"}`);
  }

  return data.obj?.esimList || data.obj?.eSimList || [];
}

async function queryEsimByIccid(iccid: string): Promise<ESimProfile | null> {
  const profiles = await queryEsims({ iccid });
  return profiles[0] || null;
}

function centsToApiPrice(cents: number): number {
  return Math.round((cents / 100) * 10000);
}

// ============= Types =============

interface OrderItem {
  packageCode: string;
  packageName: string;
  locationName: string;
  quantity: number;
  price: number;
  volume: number;
  duration: number;
}

interface PackageInfo {
  packageCode: string;
  count: number;
  price: number;
}

interface EsimRecord {
  iccid: string;
  status: string;
}

interface RefreshResult {
  iccid: string;
  success: boolean;
  error?: string;
}

// ============= Actions =============

export const fulfillOrder = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getOrderInternal, { orderId: args.orderId });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "paid") {
      throw new Error("Order is not in paid status");
    }

    await ctx.runMutation(internal.orders.updateOrderStatusInternal, {
      orderId: args.orderId,
      status: "processing",
    });

    try {
      // Fetch current wholesale prices from packages table
      const packageCodes = order.items.map((item: OrderItem) => item.packageCode);
      const packages = await ctx.runQuery(internal.packages.getPackagesByCodesInternal, { packageCodes });

      // Create a map of packageCode -> wholesale price
      const wholesalePrices = new Map<string, number>();
      for (const pkg of packages) {
        if (pkg) {
          wholesalePrices.set(pkg.packageCode, pkg.price); // pkg.price is wholesale price in cents
        }
      }

      const packageInfoList = order.items.map((item: OrderItem) => {
        const wholesaleCents = wholesalePrices.get(item.packageCode);
        if (!wholesaleCents) {
          throw new Error(`Package not found: ${item.packageCode}`);
        }
        return {
          packageCode: item.packageCode,
          count: item.quantity,
          price: centsToApiPrice(wholesaleCents), // Use wholesale price, not retail
        };
      });

      const totalApiPrice = packageInfoList.reduce(
        (sum: number, pkg: PackageInfo) => sum + pkg.price * pkg.count,
        0
      );

      const orderNo = await orderEsim({
        transactionId: order.transactionId,
        amount: totalApiPrice,
        packageInfoList,
      });

      await ctx.runMutation(internal.orders.updateOrderStatusInternal, {
        orderId: args.orderId,
        status: "processing",
        orderNo,
      });

      // Retry fetching eSIMs with delay - they may still be provisioning
      let esims: ESimProfile[] = [];
      const maxRetries = 5;
      const retryDelay = 3000; // 3 seconds

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        esims = await queryEsims({ orderNo });
        if (esims.length > 0) {
          break;
        }
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      // If still no eSIMs after retries, mark as fulfilled anyway (user can refresh later)
      if (esims.length === 0) {
        await ctx.runMutation(internal.orders.updateOrderStatusInternal, {
          orderId: args.orderId,
          status: "fulfilled",
        });
        return { success: true, orderNo, esimCount: 0, note: "eSIMs are still provisioning. Refresh in a few minutes." };
      }

      // Map eSIMs to order items - packageCode is in packageList array
      for (let i = 0; i < esims.length; i++) {
        const esim = esims[i];
        // Get packageCode from the eSIM's packageList (first package)
        const esimPackageCode = esim.packageList?.[0]?.packageCode;

        // Try to match by packageCode from packageList, or fall back to order item by index
        const orderItem = esimPackageCode
          ? order.items.find((item: OrderItem) => item.packageCode === esimPackageCode)
          : (order.items[i] || order.items[0]);

        await ctx.runMutation(internal.orders.createEsimRecord, {
          orderId: args.orderId,
          userId: order.userId,
          iccid: esim.iccid,
          imsi: esim.imsi,
          activationCode: esim.ac,
          qrCodeUrl: esim.qrCodeUrl,
          smdpAddress: esim.smdpAddress,
          status: esim.esimStatus,
          packageCode: esimPackageCode || orderItem?.packageCode || "unknown",
          packageName: orderItem?.packageName || "Unknown",
          locationName: orderItem?.locationName || "Unknown",
          dataTotal: esim.totalVolume,
          duration: esim.packageList?.[0]?.duration || orderItem?.duration || 0,
        });
      }

      await ctx.runMutation(internal.orders.updateOrderStatusInternal, {
        orderId: args.orderId,
        status: "fulfilled",
      });

      return { success: true, orderNo, esimCount: esims.length };
    } catch (error) {
      await ctx.runMutation(internal.orders.updateOrderStatusInternal, {
        orderId: args.orderId,
        status: "failed",
      });

      throw error;
    }
  },
});

export const refreshEsimStatus = action({
  args: { iccid: v.string() },
  handler: async (ctx, args) => {
    const esimData = await queryEsimByIccid(args.iccid);

    if (esimData) {
      await ctx.runMutation(internal.orders.updateEsimFromApi, {
        iccid: args.iccid,
        status: esimData.esimStatus,
        dataUsed: esimData.orderUsage,
        expiresAt: esimData.expiredTime ? new Date(esimData.expiredTime).getTime() : undefined,
      });
    }

    return esimData;
  },
});

// ============= Fetch eSIMs for Order (for orders where eSIMs weren't ready at checkout) =============
export const fetchOrderEsims = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getOrderInternal, { orderId: args.orderId });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.orderNo) {
      throw new Error("Order has no eSIM Access order number");
    }

    const esims = await queryEsims({ orderNo: order.orderNo });

    let created = 0;
    const existingEsims = await ctx.runQuery(internal.orders.getOrderEsimsInternal, { orderId: args.orderId });

    for (let i = 0; i < esims.length; i++) {
      const esim = esims[i];
      const exists = existingEsims.some((e: { iccid: string }) => e.iccid === esim.iccid);

      if (!exists) {
        const esimPackageCode = esim.packageList?.[0]?.packageCode;
        const orderItem = esimPackageCode
          ? order.items.find((item: OrderItem) => item.packageCode === esimPackageCode)
          : (order.items[i] || order.items[0]);

        await ctx.runMutation(internal.orders.createEsimRecord, {
          orderId: args.orderId,
          userId: order.userId,
          iccid: esim.iccid,
          imsi: esim.imsi,
          activationCode: esim.ac,
          qrCodeUrl: esim.qrCodeUrl,
          smdpAddress: esim.smdpAddress,
          status: esim.esimStatus,
          packageCode: esimPackageCode || orderItem?.packageCode || "unknown",
          packageName: orderItem?.packageName || "Unknown",
          locationName: orderItem?.locationName || "Unknown",
          dataTotal: esim.totalVolume,
          duration: esim.packageList?.[0]?.duration || orderItem?.duration || 0,
        });
        created++;
      }
    }

    return { fetched: esims.length, created };
  },
});

// ============= Suspend eSIM =============
export const suspendEsim = action({
  args: { iccid: v.string() },
  handler: async (ctx, args) => {
    const response = await apiRequest<{ errorCode: string; errorMsg?: string }>(
      "/api/v1/open/esim/suspend",
      { iccid: args.iccid }
    );

    // Refresh status after suspend
    const esimData = await queryEsimByIccid(args.iccid);
    if (esimData) {
      await ctx.runMutation(internal.orders.updateEsimFromApi, {
        iccid: args.iccid,
        status: esimData.esimStatus,
        dataUsed: esimData.orderUsage,
      });
    }

    return { success: true };
  },
});

// ============= Unsuspend eSIM =============
export const unsuspendEsim = action({
  args: { iccid: v.string() },
  handler: async (ctx, args) => {
    const response = await apiRequest<{ errorCode: string; errorMsg?: string }>(
      "/api/v1/open/esim/unsuspend",
      { iccid: args.iccid }
    );

    // Refresh status after unsuspend
    const esimData = await queryEsimByIccid(args.iccid);
    if (esimData) {
      await ctx.runMutation(internal.orders.updateEsimFromApi, {
        iccid: args.iccid,
        status: esimData.esimStatus,
        dataUsed: esimData.orderUsage,
      });
    }

    return { success: true };
  },
});

// ============= Cancel eSIM (before installation only) =============
export const cancelEsim = action({
  args: { iccid: v.string() },
  handler: async (ctx, args) => {
    // Can only cancel when esimStatus = GOT_RESOURCE and smdpStatus = RELEASED
    const response = await apiRequest<{ errorCode: string; errorMsg?: string }>(
      "/api/v1/open/esim/cancel",
      { iccid: args.iccid }
    );

    // Update local status
    await ctx.runMutation(internal.orders.updateEsimFromApi, {
      iccid: args.iccid,
      status: "CANCEL",
    });

    return { success: true };
  },
});

// ============= Revoke eSIM (permanent removal) =============
export const revokeEsim = action({
  args: { iccid: v.string() },
  handler: async (ctx, args) => {
    const response = await apiRequest<{ errorCode: string; errorMsg?: string }>(
      "/api/v1/open/esim/revoke",
      { iccid: args.iccid }
    );

    // Update local status
    await ctx.runMutation(internal.orders.updateEsimFromApi, {
      iccid: args.iccid,
      status: "CANCEL",
    });

    return { success: true };
  },
});

// ============= Get Merchant Balance =============
interface BalanceResponse {
  errorCode: string;
  errorMsg?: string;
  obj: {
    balance: number; // Amount × 10,000
  };
}

export const getMerchantBalance = action({
  args: {},
  handler: async () => {
    const response = await apiRequest<BalanceResponse>(
      "/api/v1/open/balance/query",
      {}
    );

    // Convert from API format (×10,000) to dollars
    const balanceDollars = response.obj.balance / 10000;

    return {
      balance: response.obj.balance,
      balanceDollars,
      balanceCents: Math.round(balanceDollars * 100),
    };
  },
});

// ============= Refresh All User eSIMs =============
export const refreshAllUserEsims = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<RefreshResult[]> => {
    const esims = await ctx.runQuery(internal.orders.getUserEsimsInternal, { clerkId: args.clerkId }) as EsimRecord[];

    const results: RefreshResult[] = [];
    for (const esim of esims) {
      try {
        const esimData = await queryEsimByIccid(esim.iccid);
        if (esimData) {
          await ctx.runMutation(internal.orders.updateEsimFromApi, {
            iccid: esim.iccid,
            status: esimData.esimStatus,
            dataUsed: esimData.orderUsage,
            expiresAt: esimData.expiredTime ? new Date(esimData.expiredTime).getTime() : undefined,
          });
          results.push({ iccid: esim.iccid, success: true });
        }
      } catch (error) {
        results.push({ iccid: esim.iccid, success: false, error: String(error) });
      }
    }

    return results;
  },
});
