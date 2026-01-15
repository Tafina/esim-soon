import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate unique transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SIM-${timestamp}-${random}`.toUpperCase();
}

// Get orders for a user
export const getUserOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return orders;
  },
});

// Get a single order (public)
export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Get a single order (internal - for use in actions)
export const getOrderInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Get order by transaction ID
export const getOrderByTransactionId = query({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_transactionId", (q) => q.eq("transactionId", args.transactionId))
      .first();
  },
});

// Get order by Stripe session ID
export const getOrderByStripeSession = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
  },
});

// Create a new order
export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(
      v.object({
        packageCode: v.string(),
        packageName: v.string(),
        locationName: v.string(),
        quantity: v.number(),
        price: v.number(),
        volume: v.number(),
        duration: v.number(),
      })
    ),
    totalAmount: v.number(),
    customerEmail: v.string(),
    stripeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transactionId = generateTransactionId();
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      transactionId,
      status: "pending",
      totalAmount: args.totalAmount,
      items: args.items,
      customerEmail: args.customerEmail,
      stripeSessionId: args.stripeSessionId,
      createdAt: now,
      updatedAt: now,
    });

    return { orderId, transactionId };
  },
});

// Create order from cart and mark as paid (for testing without payment processor)
export const createOrderFromCart = mutation({
  args: {
    sessionId: v.string(),
    customerEmail: v.string(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get cart
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get or create user
    let user = args.clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
          .first()
      : await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
          .first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.customerEmail,
        clerkId: args.clerkId,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Get package details
    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const pkg = await ctx.db
        .query("packages")
        .withIndex("by_packageCode", (q) => q.eq("packageCode", cartItem.packageCode))
        .first();

      if (!pkg) {
        throw new Error(`Package not found: ${cartItem.packageCode}`);
      }

      const itemTotal = pkg.retailPrice * cartItem.quantity;
      totalAmount += itemTotal;

      items.push({
        packageCode: pkg.packageCode,
        packageName: pkg.name,
        locationName: pkg.locationName,
        quantity: cartItem.quantity,
        price: pkg.retailPrice,
        volume: pkg.volume,
        duration: pkg.duration,
      });
    }

    // Create order with "paid" status (simulating successful payment)
    const transactionId = generateTransactionId();
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      transactionId,
      status: "paid", // Mark as paid immediately for testing
      totalAmount,
      items,
      customerEmail: args.customerEmail,
      createdAt: now,
      updatedAt: now,
    });

    // Clear the cart
    await ctx.db.patch(cart._id, {
      items: [],
      updatedAt: now,
    });

    return { orderId, transactionId, totalAmount };
  },
});

// Update order status (public)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("fulfilled"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    orderNo: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.orderNo) updates.orderNo = args.orderNo;
    if (args.stripePaymentIntentId) updates.stripePaymentIntentId = args.stripePaymentIntentId;

    await ctx.db.patch(args.orderId, updates);
    return { success: true };
  },
});

// Update order status (internal - for use in actions)
export const updateOrderStatusInternal = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("fulfilled"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    orderNo: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.orderNo) updates.orderNo = args.orderNo;
    if (args.stripePaymentIntentId) updates.stripePaymentIntentId = args.stripePaymentIntentId;

    await ctx.db.patch(args.orderId, updates);
    return { success: true };
  },
});

// Internal mutation to create eSIM records
export const createEsimRecord = internalMutation({
  args: {
    orderId: v.id("orders"),
    userId: v.id("users"),
    iccid: v.string(),
    imsi: v.optional(v.string()),
    activationCode: v.string(),
    qrCodeUrl: v.optional(v.string()),
    smdpAddress: v.optional(v.string()),
    status: v.string(),
    packageCode: v.string(),
    packageName: v.string(),
    locationName: v.string(),
    dataTotal: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("esims", {
      orderId: args.orderId,
      userId: args.userId,
      iccid: args.iccid,
      imsi: args.imsi,
      activationCode: args.activationCode,
      qrCodeUrl: args.qrCodeUrl,
      smdpAddress: args.smdpAddress,
      status: args.status as "CREATE" | "PAID" | "GOT_RESOURCE" | "IN_USE" | "USED_UP" | "UNUSED_EXPIRED" | "USED_EXPIRED" | "CANCEL",
      packageCode: args.packageCode,
      packageName: args.packageName,
      locationName: args.locationName,
      dataTotal: args.dataTotal,
      duration: args.duration,
      createdAt: Date.now(),
    });
  },
});

// Get eSIMs for a user
export const getUserEsims = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("esims")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get eSIMs for a user by Clerk ID
export const getUserEsimsByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("esims")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get orders for a user by Clerk ID
export const getUserOrdersByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Internal query for getting user eSIMs by Clerk ID (for actions)
export const getUserEsimsInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("esims")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get eSIMs for an order
export const getOrderEsims = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("esims")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// Get eSIMs for an order (internal - for use in actions)
export const getOrderEsimsInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("esims")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// Get a single eSIM by ID
export const getEsim = query({
  args: { esimId: v.id("esims") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.esimId);
  },
});

// Internal mutation to update eSIM from API data
export const updateEsimFromApi = internalMutation({
  args: {
    iccid: v.string(),
    status: v.string(),
    dataUsed: v.optional(v.number()),
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const esim = await ctx.db
      .query("esims")
      .withIndex("by_iccid", (q) => q.eq("iccid", args.iccid))
      .first();

    if (esim) {
      const updates: Record<string, unknown> = {
        status: args.status as "CREATE" | "PAID" | "GOT_RESOURCE" | "IN_USE" | "USED_UP" | "UNUSED_EXPIRED" | "USED_EXPIRED" | "CANCEL",
      };
      if (args.dataUsed !== undefined) updates.dataUsed = args.dataUsed;
      if (args.activatedAt !== undefined) updates.activatedAt = args.activatedAt;
      if (args.expiresAt !== undefined) updates.expiresAt = args.expiresAt;

      await ctx.db.patch(esim._id, updates);
    }
  },
});
