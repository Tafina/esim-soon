import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to check if user is admin
async function isAdmin(ctx: { db: any }, clerkId: string): Promise<boolean> {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
    .first();
  return user?.role === "admin";
}

// ============= Dashboard Stats =============

export const getDashboardStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const orders = await ctx.db.query("orders").collect();
    const esims = await ctx.db.query("esims").collect();
    const packages = await ctx.db.query("packages").collect();

    // Calculate revenue
    const totalRevenue = orders
      .filter((o) => o.status === "fulfilled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Recent orders (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter((o) => o.createdAt > weekAgo);
    const recentRevenue = recentOrders
      .filter((o) => o.status === "fulfilled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Active eSIMs
    const activeEsims = esims.filter(
      (e) => e.status === "IN_USE" || e.status === "GOT_RESOURCE"
    );

    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalEsims: esims.length,
      totalPackages: packages.length,
      totalRevenue,
      recentOrders: recentOrders.length,
      recentRevenue,
      activeEsims: activeEsims.length,
      ordersByStatus: {
        pending: orders.filter((o) => o.status === "pending").length,
        paid: orders.filter((o) => o.status === "paid").length,
        processing: orders.filter((o) => o.status === "processing").length,
        fulfilled: orders.filter((o) => o.status === "fulfilled").length,
        failed: orders.filter((o) => o.status === "failed").length,
        refunded: orders.filter((o) => o.status === "refunded").length,
      },
    };
  },
});

// ============= User Management =============

export const getAllUsers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").order("desc").collect();

    // Get order counts and total spent for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const esims = await ctx.db
          .query("esims")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const totalSpent = orders
          .filter((o) => o.status === "fulfilled")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          ...user,
          orderCount: orders.length,
          esimCount: esims.length,
          totalSpent,
        };
      })
    );

    return usersWithStats;
  },
});

export const updateUserRole = mutation({
  args: {
    clerkId: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Check if user has orders - don't delete if they do
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (orders) {
      throw new Error("Cannot delete user with existing orders");
    }

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

// ============= Order Management =============

export const getAllOrders = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const orders = await ctx.db.query("orders").order("desc").collect();

    // Get user info for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        const esims = await ctx.db
          .query("esims")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();

        return {
          ...order,
          user: user ? { email: user.email, name: user.name } : null,
          esimCount: esims.length,
        };
      })
    );

    return ordersWithUsers;
  },
});

export const updateOrderStatus = mutation({
  args: {
    clerkId: v.string(),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("fulfilled"),
      v.literal("failed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// ============= eSIM Management =============

export const getAllEsims = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const esims = await ctx.db.query("esims").order("desc").collect();

    // Get user and order info
    const esimsWithDetails = await Promise.all(
      esims.map(async (esim) => {
        const user = await ctx.db.get(esim.userId);
        const order = await ctx.db.get(esim.orderId);

        return {
          ...esim,
          user: user ? { email: user.email, name: user.name } : null,
          order: order ? { transactionId: order.transactionId } : null,
        };
      })
    );

    return esimsWithDetails;
  },
});

// ============= Package Management =============

export const getAllPackages = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const packages = await ctx.db.query("packages").collect();

    // Sort by location name then by volume
    return packages.sort((a, b) => {
      if (a.locationName !== b.locationName) {
        return a.locationName.localeCompare(b.locationName);
      }
      return a.volume - b.volume;
    });
  },
});

export const updatePackage = mutation({
  args: {
    clerkId: v.string(),
    packageId: v.id("packages"),
    retailPrice: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.packageId, {
      retailPrice: args.retailPrice,
      description: args.description,
      lastSynced: Date.now(),
    });
    return { success: true };
  },
});

export const deletePackage = mutation({
  args: {
    clerkId: v.string(),
    packageId: v.id("packages"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.packageId);
    return { success: true };
  },
});

// Helper to get region from country code
function getRegionForCountry(code: string): string {
  const regionMap: Record<string, string> = {
    // Europe
    AT: "Europe", BE: "Europe", BG: "Europe", HR: "Europe", CY: "Europe",
    CZ: "Europe", DK: "Europe", EE: "Europe", FI: "Europe", FR: "Europe",
    DE: "Europe", GR: "Europe", HU: "Europe", IE: "Europe", IT: "Europe",
    LV: "Europe", LT: "Europe", LU: "Europe", MT: "Europe", NL: "Europe",
    PL: "Europe", PT: "Europe", RO: "Europe", SK: "Europe", SI: "Europe",
    ES: "Europe", SE: "Europe", GB: "Europe", CH: "Europe", NO: "Europe",
    IS: "Europe", UA: "Europe", RS: "Europe", AL: "Europe", MK: "Europe",
    BA: "Europe", ME: "Europe", XK: "Europe", MD: "Europe", BY: "Europe",
    // Asia
    CN: "Asia", JP: "Asia", KR: "Asia", IN: "Asia", ID: "Asia",
    TH: "Asia", VN: "Asia", MY: "Asia", SG: "Asia", PH: "Asia",
    TW: "Asia", HK: "Asia", MO: "Asia", BD: "Asia", PK: "Asia",
    LK: "Asia", NP: "Asia", MM: "Asia", KH: "Asia", LA: "Asia",
    MN: "Asia", KZ: "Asia", UZ: "Asia", AF: "Asia", TJ: "Asia",
    KG: "Asia", TM: "Asia", AZ: "Asia", GE: "Asia", AM: "Asia",
    // Americas
    US: "Americas", CA: "Americas", MX: "Americas", BR: "Americas",
    AR: "Americas", CL: "Americas", CO: "Americas", PE: "Americas",
    VE: "Americas", EC: "Americas", BO: "Americas", PY: "Americas",
    UY: "Americas", CR: "Americas", PA: "Americas", GT: "Americas",
    HN: "Americas", SV: "Americas", NI: "Americas", CU: "Americas",
    DO: "Americas", PR: "Americas", JM: "Americas", TT: "Americas",
    HT: "Americas", BS: "Americas", BB: "Americas", BZ: "Americas",
    GY: "Americas", SR: "Americas",
    // Oceania
    AU: "Oceania", NZ: "Oceania", FJ: "Oceania", PG: "Oceania",
    WS: "Oceania", TO: "Oceania", VU: "Oceania", SB: "Oceania",
    // Africa
    ZA: "Africa", EG: "Africa", NG: "Africa", KE: "Africa", GH: "Africa",
    TZ: "Africa", UG: "Africa", ET: "Africa", MA: "Africa", TN: "Africa",
    DZ: "Africa", SN: "Africa", CI: "Africa", CM: "Africa", ZW: "Africa",
    AO: "Africa", MZ: "Africa", MG: "Africa", RW: "Africa", ZM: "Africa",
    BW: "Africa", NA: "Africa", MW: "Africa", LY: "Africa", SD: "Africa",
    // Middle East
    AE: "Middle East", SA: "Middle East", IL: "Middle East", TR: "Middle East",
    QA: "Middle East", KW: "Middle East", BH: "Middle East", OM: "Middle East",
    JO: "Middle East", LB: "Middle East", IQ: "Middle East", IR: "Middle East",
    YE: "Middle East", SY: "Middle East", PS: "Middle East",
  };
  return regionMap[code.toUpperCase()] || "Other";
}

// Helper to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  // Convert country code to flag emoji using regional indicator symbols
  // A = 🇦 (U+1F1E6), B = 🇧 (U+1F1E7), etc.
  if (code.length !== 2) return "🌍";
  const firstChar = code.charCodeAt(0) - 65 + 0x1F1E6;
  const secondChar = code.charCodeAt(1) - 65 + 0x1F1E6;
  return String.fromCodePoint(firstChar, secondChar);
}

export const addPackageManual = mutation({
  args: {
    clerkId: v.string(),
    packageCode: v.string(),
    name: v.string(),
    locationCode: v.string(),
    locationName: v.string(),
    price: v.number(),
    retailPrice: v.number(),
    currencyCode: v.string(),
    volume: v.number(),
    duration: v.number(),
    activeType: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const locationCode = args.locationCode.toUpperCase();

    // Check if country exists, create if not
    const existingCountry = await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", locationCode))
      .first();

    if (!existingCountry) {
      // Auto-create the country
      await ctx.db.insert("countries", {
        code: locationCode,
        name: args.locationName,
        region: getRegionForCountry(locationCode),
        flagEmoji: getFlagEmoji(locationCode),
        popular: false,
      });
    }

    // Check if package already exists
    const existing = await ctx.db
      .query("packages")
      .withIndex("by_packageCode", (q) => q.eq("packageCode", args.packageCode))
      .first();

    if (existing) {
      // Update existing package
      await ctx.db.patch(existing._id, {
        name: args.name,
        locationCode: locationCode,
        locationName: args.locationName,
        price: args.price,
        retailPrice: args.retailPrice,
        currencyCode: args.currencyCode,
        volume: args.volume,
        duration: args.duration,
        activeType: args.activeType,
        description: args.description,
        lastSynced: Date.now(),
      });
      return { success: true, updated: true, packageId: existing._id, countryCreated: !existingCountry };
    }

    // Create new package
    const packageId = await ctx.db.insert("packages", {
      packageCode: args.packageCode,
      name: args.name,
      locationCode: locationCode,
      locationName: args.locationName,
      price: args.price,
      retailPrice: args.retailPrice,
      currencyCode: args.currencyCode,
      volume: args.volume,
      duration: args.duration,
      activeType: args.activeType,
      description: args.description,
      lastSynced: Date.now(),
    });

    return { success: true, updated: false, packageId, countryCreated: !existingCountry };
  },
});

// ============= Country Management =============

export const getAllCountries = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("countries").collect();
  },
});

export const updateCountry = mutation({
  args: {
    clerkId: v.string(),
    countryId: v.id("countries"),
    name: v.optional(v.string()),
    region: v.optional(v.string()),
    flagEmoji: v.optional(v.string()),
    popular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.region !== undefined) updates.region = args.region;
    if (args.flagEmoji !== undefined) updates.flagEmoji = args.flagEmoji;
    if (args.popular !== undefined) updates.popular = args.popular;

    await ctx.db.patch(args.countryId, updates);
    return { success: true };
  },
});

export const createCountry = mutation({
  args: {
    clerkId: v.string(),
    code: v.string(),
    name: v.string(),
    region: v.string(),
    flagEmoji: v.string(),
    popular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const code = args.code.toUpperCase();

    // Check if country already exists (using uppercase code)
    const existing = await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (existing) {
      throw new Error("Country with this code already exists");
    }

    const countryId = await ctx.db.insert("countries", {
      code,
      name: args.name,
      region: args.region,
      flagEmoji: args.flagEmoji,
      popular: args.popular || false,
    });

    return { success: true, countryId };
  },
});

export const deleteCountry = mutation({
  args: {
    clerkId: v.string(),
    countryId: v.id("countries"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.countryId);
    return { success: true };
  },
});

// ============= Bundle Management =============

export const getAllBundles = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all countries with region "Bundle"
    const bundles = await ctx.db
      .query("countries")
      .withIndex("by_region", (q) => q.eq("region", "Bundle"))
      .collect();

    // Get package counts for each bundle
    const allPackages = await ctx.db.query("packages").collect();
    const packagesByLocation = new Map<string, number>();

    for (const pkg of allPackages) {
      const count = packagesByLocation.get(pkg.locationCode) || 0;
      packagesByLocation.set(pkg.locationCode, count + 1);
    }

    return bundles.map((bundle) => ({
      ...bundle,
      packageCount: packagesByLocation.get(bundle.code) || 0,
    }));
  },
});

// Helper to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export const updateBundle = mutation({
  args: {
    clerkId: v.string(),
    bundleId: v.id("countries"),
    customName: v.optional(v.string()),
    description: v.optional(v.string()),
    includedCountries: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Verify this is actually a bundle
    const bundle = await ctx.db.get(args.bundleId);
    if (!bundle || bundle.region !== "Bundle") {
      throw new Error("Not a valid bundle");
    }

    const updates: Record<string, any> = {};
    if (args.customName !== undefined) {
      updates.customName = args.customName;
      // Auto-generate slug from custom name
      if (args.customName) {
        updates.slug = generateSlug(args.customName);
      }
    }
    if (args.description !== undefined) updates.description = args.description;
    if (args.includedCountries !== undefined) updates.includedCountries = args.includedCountries;

    await ctx.db.patch(args.bundleId, updates);
    return { success: true };
  },
});

export const deleteBundle = mutation({
  args: {
    clerkId: v.string(),
    bundleId: v.id("countries"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.clerkId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Verify this is actually a bundle
    const bundle = await ctx.db.get(args.bundleId);
    if (!bundle || bundle.region !== "Bundle") {
      throw new Error("Not a valid bundle");
    }

    // Also delete associated packages
    const packages = await ctx.db
      .query("packages")
      .withIndex("by_location", (q) => q.eq("locationCode", bundle.code))
      .collect();

    for (const pkg of packages) {
      await ctx.db.delete(pkg._id);
    }

    await ctx.db.delete(args.bundleId);
    return { success: true, packagesDeleted: packages.length };
  },
});

// ============= Check Admin Status =============

export const checkIsAdmin = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await isAdmin(ctx, args.clerkId);
  },
});

// Internal version for use in actions
export const checkIsAdminInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await isAdmin(ctx, args.clerkId);
  },
});

// ============= Make First Admin (one-time setup) =============

export const makeAdmin = mutation({
  args: { clerkId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    // Check if any admin exists
    const users = await ctx.db.query("users").collect();
    const existingAdmin = users.find((u) => u.role === "admin");

    // If admin exists, require admin permission
    if (existingAdmin) {
      const requestingUser = users.find((u) => u.clerkId === args.clerkId);
      if (requestingUser?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can create new admins");
      }
    }

    // Find user by email and make them admin
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!targetUser) {
      throw new Error("User not found with that email");
    }

    await ctx.db.patch(targetUser._id, { role: "admin" });
    return { success: true, userId: targetUser._id };
  },
});
