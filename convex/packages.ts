import { v } from "convex/values";
import { query, internalMutation, internalQuery } from "./_generated/server";

// Query all unique countries with packages
export const getCountries = query({
  args: {},
  handler: async (ctx) => {
    const countries = await ctx.db.query("countries").collect();
    const allPackages = await ctx.db.query("packages").collect();

    // If no countries exist but we have packages, auto-generate countries from packages
    if (countries.length === 0 && allPackages.length > 0) {
      // Group packages by location and return minimal country data
      const countryMap = new Map<string, { name: string; minPrice: number; count: number }>();

      for (const pkg of allPackages) {
        const code = pkg.locationCode;
        // Only include 2-letter country codes (exclude bundles)
        if (code.length !== 2) continue;

        const existing = countryMap.get(code);
        if (existing) {
          existing.count++;
          if (pkg.retailPrice < existing.minPrice) {
            existing.minPrice = pkg.retailPrice;
          }
        } else {
          countryMap.set(code, {
            name: pkg.locationName || code,
            minPrice: pkg.retailPrice,
            count: 1,
          });
        }
      }

      // Return auto-generated country data
      return Array.from(countryMap.entries()).map(([code, data]) => ({
        code,
        name: data.name,
        region: "Other",
        flagEmoji: code.length === 2
          ? String.fromCodePoint(
              code.charCodeAt(0) - 65 + 0x1F1E6,
              code.charCodeAt(1) - 65 + 0x1F1E6
            )
          : "🌍",
        minPrice: data.minPrice,
        packageCount: data.count,
        popular: false,
      }));
    }

    // Group packages by location
    const packagesByLocation = new Map<string, { count: number; minPrice: number }>();

    for (const pkg of allPackages) {
      const existing = packagesByLocation.get(pkg.locationCode);
      if (existing) {
        existing.count++;
        if (pkg.retailPrice < existing.minPrice) {
          existing.minPrice = pkg.retailPrice;
        }
      } else {
        packagesByLocation.set(pkg.locationCode, {
          count: 1,
          minPrice: pkg.retailPrice,
        });
      }
    }

    // Update countries with correct counts
    return countries.map((country) => {
      const packageInfo = packagesByLocation.get(country.code);
      return {
        ...country,
        packageCount: packageInfo?.count ?? 0,
        minPrice: packageInfo?.minPrice ?? country.minPrice,
      };
    });
  },
});

// Query countries by region
export const getCountriesByRegion = query({
  args: { region: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_region", (q) => q.eq("region", args.region))
      .collect();
  },
});

// Query countries for marquee display (random selection)
export const getMarqueeCountries = query({
  args: {},
  handler: async (ctx) => {
    const countries = await ctx.db.query("countries").collect();
    // Return up to 12 countries with valid names for marquee
    return countries
      .filter((c) => c.name && c.name.length > 2 && c.flagEmoji)
      .slice(0, 12)
      .map((c) => ({
        name: c.name,
        flagEmoji: c.flagEmoji,
      }));
  },
});

// Query popular countries
export const getPopularCountries = query({
  args: {},
  handler: async (ctx) => {
    const countries = await ctx.db.query("countries").collect();
    const allPackages = await ctx.db.query("packages").collect();

    // Group packages by location
    const packagesByLocation = new Map<string, { count: number; minPrice: number }>();

    for (const pkg of allPackages) {
      const existing = packagesByLocation.get(pkg.locationCode);
      if (existing) {
        existing.count++;
        if (pkg.retailPrice < existing.minPrice) {
          existing.minPrice = pkg.retailPrice;
        }
      } else {
        packagesByLocation.set(pkg.locationCode, {
          count: 1,
          minPrice: pkg.retailPrice,
        });
      }
    }

    return countries
      .filter((c) => c.popular)
      .map((country) => {
        const packageInfo = packagesByLocation.get(country.code);
        return {
          ...country,
          packageCount: packageInfo?.count ?? 0,
          minPrice: packageInfo?.minPrice ?? country.minPrice,
        };
      })
      .slice(0, 12);
  },
});

// Get a single country by code
export const getCountryByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    // Always use uppercase for consistency
    const code = args.code.toUpperCase();

    const country = await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!country) return null;

    // Get packages for this country
    const packages = await ctx.db
      .query("packages")
      .withIndex("by_location", (q) => q.eq("locationCode", code))
      .collect();

    const minPrice = packages.length > 0
      ? Math.min(...packages.map((p) => p.retailPrice))
      : country.minPrice;

    return {
      ...country,
      packageCount: packages.length,
      minPrice,
    };
  },
});

// Query packages for a specific country
export const getPackagesByLocation = query({
  args: { locationCode: v.string() },
  handler: async (ctx, args) => {
    // Always use uppercase for consistency
    const code = args.locationCode.toUpperCase();

    const packages = await ctx.db
      .query("packages")
      .withIndex("by_location", (q) => q.eq("locationCode", code))
      .collect();

    // Sort by volume then duration
    return packages.sort((a, b) => {
      if (a.volume !== b.volume) return a.volume - b.volume;
      return a.duration - b.duration;
    });
  },
});

// Get a single package by code
export const getPackageByCode = query({
  args: { packageCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("packages")
      .withIndex("by_packageCode", (q) => q.eq("packageCode", args.packageCode))
      .first();
  },
});

// Get multiple packages by codes (for cart)
export const getPackagesByCodes = query({
  args: { packageCodes: v.array(v.string()) },
  handler: async (ctx, args) => {
    const packages = await Promise.all(
      args.packageCodes.map((code) =>
        ctx.db
          .query("packages")
          .withIndex("by_packageCode", (q) => q.eq("packageCode", code))
          .first()
      )
    );
    return packages.filter((p) => p !== null);
  },
});

// Search packages across all countries
export const searchPackages = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const packages = await ctx.db.query("packages").collect();

    return packages
      .filter(
        (p) =>
          p.locationName.toLowerCase().includes(searchTerm) ||
          p.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 20);
  },
});

// Query all bundles (multi-country packages)
export const getBundles = query({
  args: {},
  handler: async (ctx) => {
    const countries = await ctx.db.query("countries").collect();
    const allPackages = await ctx.db.query("packages").collect();

    // Bundles are countries with region "Bundle"
    const bundles = countries.filter((c) => c.region === "Bundle");

    // Group packages by location
    const packagesByLocation = new Map<string, { count: number; minPrice: number }>();

    for (const pkg of allPackages) {
      const existing = packagesByLocation.get(pkg.locationCode);
      if (existing) {
        existing.count++;
        if (pkg.retailPrice < existing.minPrice) {
          existing.minPrice = pkg.retailPrice;
        }
      } else {
        packagesByLocation.set(pkg.locationCode, {
          count: 1,
          minPrice: pkg.retailPrice,
        });
      }
    }

    return bundles.map((bundle) => {
      const packageInfo = packagesByLocation.get(bundle.code);
      return {
        ...bundle,
        packageCount: packageInfo?.count ?? 0,
        minPrice: packageInfo?.minPrice ?? bundle.minPrice,
      };
    });
  },
});

// Query packages for a specific bundle (supports both code and slug)
export const getBundlePackages = query({
  args: { bundleCode: v.string() },
  handler: async (ctx, args) => {
    // First try to find bundle by slug to get the actual code
    let locationCode = args.bundleCode;

    const bundleBySlug = await ctx.db
      .query("countries")
      .withIndex("by_slug", (q) => q.eq("slug", args.bundleCode))
      .first();

    if (bundleBySlug) {
      locationCode = bundleBySlug.code;
    }

    const packages = await ctx.db
      .query("packages")
      .withIndex("by_location", (q) => q.eq("locationCode", locationCode))
      .collect();

    // Sort by volume then duration
    return packages.sort((a, b) => {
      if (a.volume !== b.volume) return a.volume - b.volume;
      return a.duration - b.duration;
    });
  },
});

// Get a single bundle by code or slug
export const getBundleByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    // First try to find by slug
    let bundle = await ctx.db
      .query("countries")
      .withIndex("by_slug", (q) => q.eq("slug", args.code))
      .first();

    // If not found by slug, try by code
    if (!bundle) {
      bundle = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", args.code))
        .first();
    }

    if (!bundle || bundle.region !== "Bundle") return null;

    const packages = await ctx.db
      .query("packages")
      .withIndex("by_location", (q) => q.eq("locationCode", bundle.code))
      .collect();

    const minPrice = packages.length > 0
      ? Math.min(...packages.map((p) => p.retailPrice))
      : bundle.minPrice;

    return {
      ...bundle,
      packageCount: packages.length,
      minPrice,
    };
  },
});

// Internal query to get packages by codes (for actions)
export const getPackagesByCodesInternal = internalQuery({
  args: { packageCodes: v.array(v.string()) },
  handler: async (ctx, args) => {
    const packages = await Promise.all(
      args.packageCodes.map((code) =>
        ctx.db
          .query("packages")
          .withIndex("by_packageCode", (q) => q.eq("packageCode", code))
          .first()
      )
    );
    return packages.filter((p) => p !== null);
  },
});

// Internal mutation to upsert a package (kept for backwards compatibility)
export const upsertPackage = internalMutation({
  args: {
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
    const existing = await ctx.db
      .query("packages")
      .withIndex("by_packageCode", (q) => q.eq("packageCode", args.packageCode))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastSynced: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("packages", {
      ...args,
      lastSynced: Date.now(),
    });
  },
});

// Internal mutation to upsert a country (kept for backwards compatibility)
export const upsertCountry = internalMutation({
  args: {
    code: v.string(),
    name: v.string(),
    region: v.string(),
    flagEmoji: v.string(),
    minPrice: v.optional(v.number()),
    packageCount: v.optional(v.number()),
    popular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("countries", args);
  },
});

// BATCH mutation to upsert multiple packages at once (much more efficient!)
export const upsertPackagesBatch = internalMutation({
  args: {
    packages: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const pkg of args.packages) {
      const existing = await ctx.db
        .query("packages")
        .withIndex("by_packageCode", (q) => q.eq("packageCode", pkg.packageCode))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...pkg,
          lastSynced: now,
        });
        updated++;
      } else {
        await ctx.db.insert("packages", {
          ...pkg,
          lastSynced: now,
        });
        inserted++;
      }
    }

    return { inserted, updated };
  },
});

// BATCH mutation to upsert multiple countries at once (much more efficient!)
export const upsertCountriesBatch = internalMutation({
  args: {
    countries: v.array(
      v.object({
        code: v.string(),
        name: v.string(),
        region: v.string(),
        flagEmoji: v.string(),
        minPrice: v.optional(v.number()),
        packageCount: v.optional(v.number()),
        popular: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const country of args.countries) {
      const existing = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", country.code))
        .first();

      if (existing) {
        // Don't overwrite custom fields like customName, slug, description, includedCountries
        await ctx.db.patch(existing._id, {
          name: country.name,
          region: country.region,
          flagEmoji: country.flagEmoji,
          minPrice: country.minPrice,
          packageCount: country.packageCount,
          popular: country.popular,
        });
        updated++;
      } else {
        await ctx.db.insert("countries", country);
        inserted++;
      }
    }

    return { inserted, updated };
  },
});
