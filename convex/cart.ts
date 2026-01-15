import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get cart by session ID
export const getCart = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart || cart.items.length === 0) {
      return { items: [], packages: [] };
    }

    // Get package details for cart items
    const packageCodes = cart.items.map((item) => item.packageCode);
    const packages = await Promise.all(
      packageCodes.map((code) =>
        ctx.db
          .query("packages")
          .withIndex("by_packageCode", (q) => q.eq("packageCode", code))
          .first()
      )
    );

    const validPackages = packages.filter((p) => p !== null);

    // Merge cart items with package details
    const itemsWithDetails = cart.items
      .map((item) => {
        const pkg = validPackages.find((p) => p?.packageCode === item.packageCode);
        if (!pkg) return null;
        return {
          ...item,
          package: pkg,
          subtotal: pkg.retailPrice * item.quantity,
        };
      })
      .filter((item) => item !== null);

    const total = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items: itemsWithDetails,
      packages: validPackages,
      total,
      itemCount: itemsWithDetails.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    sessionId: v.string(),
    packageCode: v.string(),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const quantity = args.quantity || 1;

    // Verify package exists
    const pkg = await ctx.db
      .query("packages")
      .withIndex("by_packageCode", (q) => q.eq("packageCode", args.packageCode))
      .first();

    if (!pkg) {
      throw new Error("Package not found");
    }

    // Get or create cart
    let cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart) {
      await ctx.db.insert("cart", {
        sessionId: args.sessionId,
        items: [{ packageCode: args.packageCode, quantity }],
        updatedAt: Date.now(),
      });
      return { success: true, action: "created" };
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.packageCode === args.packageCode
    );

    let newItems;
    if (existingIndex >= 0) {
      newItems = [...cart.items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
      };
    } else {
      newItems = [...cart.items, { packageCode: args.packageCode, quantity }];
    }

    await ctx.db.patch(cart._id, {
      items: newItems,
      updatedAt: Date.now(),
    });

    return { success: true, action: existingIndex >= 0 ? "updated" : "added" };
  },
});

// Update item quantity
export const updateCartItem = mutation({
  args: {
    sessionId: v.string(),
    packageCode: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    let newItems;
    if (args.quantity <= 0) {
      // Remove item
      newItems = cart.items.filter((item) => item.packageCode !== args.packageCode);
    } else {
      // Update quantity
      newItems = cart.items.map((item) =>
        item.packageCode === args.packageCode
          ? { ...item, quantity: args.quantity }
          : item
      );
    }

    await ctx.db.patch(cart._id, {
      items: newItems,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    sessionId: v.string(),
    packageCode: v.string(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart) {
      return { success: true };
    }

    const newItems = cart.items.filter(
      (item) => item.packageCode !== args.packageCode
    );

    await ctx.db.patch(cart._id, {
      items: newItems,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Clear cart
export const clearCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (cart) {
      await ctx.db.patch(cart._id, {
        items: [],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Link cart to user after authentication
export const linkCartToUser = mutation({
  args: {
    sessionId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (cart) {
      await ctx.db.patch(cart._id, {
        userId: args.userId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
