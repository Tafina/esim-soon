import { mutation } from "./_generated/server";

// Sample data for testing without eSIM Access API
export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingPackages = await ctx.db.query("packages").first();
    if (existingPackages) {
      return { message: "Already seeded" };
    }

    // Sample countries
    const countries = [
      { code: "US", name: "United States", region: "Americas", flagEmoji: "\u{1F1FA}\u{1F1F8}", popular: true },
      { code: "GB", name: "United Kingdom", region: "Europe", flagEmoji: "\u{1F1EC}\u{1F1E7}", popular: true },
      { code: "JP", name: "Japan", region: "Asia", flagEmoji: "\u{1F1EF}\u{1F1F5}", popular: true },
      { code: "KR", name: "South Korea", region: "Asia", flagEmoji: "\u{1F1F0}\u{1F1F7}", popular: true },
      { code: "TH", name: "Thailand", region: "Asia", flagEmoji: "\u{1F1F9}\u{1F1ED}", popular: true },
      { code: "FR", name: "France", region: "Europe", flagEmoji: "\u{1F1EB}\u{1F1F7}", popular: true },
      { code: "DE", name: "Germany", region: "Europe", flagEmoji: "\u{1F1E9}\u{1F1EA}", popular: true },
      { code: "IT", name: "Italy", region: "Europe", flagEmoji: "\u{1F1EE}\u{1F1F9}", popular: true },
      { code: "ES", name: "Spain", region: "Europe", flagEmoji: "\u{1F1EA}\u{1F1F8}", popular: true },
      { code: "AU", name: "Australia", region: "Oceania", flagEmoji: "\u{1F1E6}\u{1F1FA}", popular: true },
      { code: "CA", name: "Canada", region: "Americas", flagEmoji: "\u{1F1E8}\u{1F1E6}", popular: true },
      { code: "SG", name: "Singapore", region: "Asia", flagEmoji: "\u{1F1F8}\u{1F1EC}", popular: true },
      { code: "CN", name: "China", region: "Asia", flagEmoji: "\u{1F1E8}\u{1F1F3}", popular: false },
      { code: "HK", name: "Hong Kong", region: "Asia", flagEmoji: "\u{1F1ED}\u{1F1F0}", popular: false },
      { code: "TW", name: "Taiwan", region: "Asia", flagEmoji: "\u{1F1F9}\u{1F1FC}", popular: false },
      { code: "VN", name: "Vietnam", region: "Asia", flagEmoji: "\u{1F1FB}\u{1F1F3}", popular: false },
      { code: "MY", name: "Malaysia", region: "Asia", flagEmoji: "\u{1F1F2}\u{1F1FE}", popular: false },
      { code: "ID", name: "Indonesia", region: "Asia", flagEmoji: "\u{1F1EE}\u{1F1E9}", popular: false },
      { code: "NL", name: "Netherlands", region: "Europe", flagEmoji: "\u{1F1F3}\u{1F1F1}", popular: false },
      { code: "CH", name: "Switzerland", region: "Europe", flagEmoji: "\u{1F1E8}\u{1F1ED}", popular: false },
      { code: "MX", name: "Mexico", region: "Americas", flagEmoji: "\u{1F1F2}\u{1F1FD}", popular: false },
      { code: "BR", name: "Brazil", region: "Americas", flagEmoji: "\u{1F1E7}\u{1F1F7}", popular: false },
      { code: "AE", name: "United Arab Emirates", region: "Middle East", flagEmoji: "\u{1F1E6}\u{1F1EA}", popular: false },
      { code: "EG", name: "Egypt", region: "Africa", flagEmoji: "\u{1F1EA}\u{1F1EC}", popular: false },
      { code: "ZA", name: "South Africa", region: "Africa", flagEmoji: "\u{1F1FF}\u{1F1E6}", popular: false },
    ];

    // Package templates (data in MB, price in cents)
    const packageTemplates = [
      { volume: 1024, duration: 7, basePrice: 499 },
      { volume: 3072, duration: 15, basePrice: 999 },
      { volume: 5120, duration: 30, basePrice: 1499 },
      { volume: 10240, duration: 30, basePrice: 2499 },
      { volume: 20480, duration: 30, basePrice: 3999 },
    ];

    // Price multipliers by region
    const regionMultipliers: Record<string, number> = {
      "Americas": 1.0,
      "Europe": 0.9,
      "Asia": 0.85,
      "Oceania": 1.1,
      "Middle East": 1.2,
      "Africa": 1.3,
    };

    let packageCount = 0;

    for (const country of countries) {
      const multiplier = regionMultipliers[country.region] || 1.0;
      let minPrice = Infinity;

      for (const template of packageTemplates) {
        const wholesalePrice = Math.round(template.basePrice * multiplier);
        const retailPrice = Math.round(wholesalePrice * 1.3); // 30% markup
        minPrice = Math.min(minPrice, retailPrice);

        await ctx.db.insert("packages", {
          packageCode: `${country.code}-${template.volume}-${template.duration}`,
          name: `${country.name} ${template.volume >= 1024 ? `${template.volume / 1024}GB` : `${template.volume}MB`} / ${template.duration} Days`,
          locationCode: country.code,
          locationName: country.name,
          price: wholesalePrice,
          retailPrice: retailPrice,
          currencyCode: "USD",
          volume: template.volume * 1024 * 1024, // Convert MB to bytes
          duration: template.duration,
          activeType: "PURCHASE",
          lastSynced: Date.now(),
        });
        packageCount++;
      }

      await ctx.db.insert("countries", {
        code: country.code,
        name: country.name,
        region: country.region,
        flagEmoji: country.flagEmoji,
        minPrice: minPrice,
        packageCount: packageTemplates.length,
        popular: country.popular,
      });
    }

    return { message: `Seeded ${countries.length} countries and ${packageCount} packages` };
  },
});
