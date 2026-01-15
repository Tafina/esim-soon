import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Optional for guest checkout
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))), // user role
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),

  packages: defineTable({
    packageCode: v.string(),
    name: v.string(),
    locationCode: v.string(),
    locationName: v.string(),
    price: v.number(), // wholesale price in cents (from API * 100)
    retailPrice: v.number(), // customer price in cents
    currencyCode: v.string(),
    volume: v.number(), // bytes
    duration: v.number(), // days
    activeType: v.string(),
    description: v.optional(v.string()),
    lastSynced: v.number(),
  })
    .index("by_location", ["locationCode"])
    .index("by_packageCode", ["packageCode"]),

  orders: defineTable({
    userId: v.id("users"),
    orderNo: v.optional(v.string()), // eSIM Access order number
    transactionId: v.string(), // our unique transaction ID
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("fulfilled"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    totalAmount: v.number(), // in cents
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
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
    customerEmail: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_transactionId", ["transactionId"])
    .index("by_stripeSessionId", ["stripeSessionId"]),

  esims: defineTable({
    orderId: v.id("orders"),
    userId: v.id("users"),
    iccid: v.string(),
    imsi: v.optional(v.string()),
    activationCode: v.string(),
    qrCodeUrl: v.optional(v.string()),
    smdpAddress: v.optional(v.string()),
    status: v.union(
      v.literal("CREATE"),
      v.literal("PAID"),
      v.literal("GOT_RESOURCE"),
      v.literal("IN_USE"),
      v.literal("USED_UP"),
      v.literal("UNUSED_EXPIRED"),
      v.literal("USED_EXPIRED"),
      v.literal("CANCEL"),
      v.literal("REVOKED")
    ),
    packageCode: v.string(),
    packageName: v.string(),
    locationName: v.string(),
    dataUsed: v.optional(v.number()), // bytes
    dataTotal: v.number(), // bytes
    duration: v.number(), // days
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"])
    .index("by_iccid", ["iccid"]),

  cart: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    items: v.array(
      v.object({
        packageCode: v.string(),
        quantity: v.number(),
      })
    ),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  // Store country metadata for better UX
  countries: defineTable({
    code: v.string(), // ISO Alpha-2
    name: v.string(),
    region: v.string(), // Europe, Asia, Americas, etc. or "Bundle" for multi-country
    flagEmoji: v.string(),
    minPrice: v.optional(v.number()), // lowest package price
    packageCount: v.optional(v.number()),
    popular: v.optional(v.boolean()),
    // Bundle-specific fields
    customName: v.optional(v.string()), // Admin-set custom display name
    slug: v.optional(v.string()), // URL-friendly slug for bundles
    includedCountries: v.optional(v.array(v.string())), // List of country names in this bundle
    description: v.optional(v.string()), // Bundle description for customers
  })
    .index("by_code", ["code"])
    .index("by_region", ["region"])
    .index("by_slug", ["slug"]),

  // Waitlist for coming soon page
  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
