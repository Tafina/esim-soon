"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac, randomUUID } from "crypto";

const API_BASE_URL = process.env.ESIM_API_BASE_URL || "https://api.esimaccess.com";

// Country name lookup from REST Countries API
const COUNTRY_NAMES: Record<string, string> = {};

async function fetchCountryNames(): Promise<void> {
  if (Object.keys(COUNTRY_NAMES).length > 0) return; // Already cached

  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name");
    if (!response.ok) {
      console.error("Failed to fetch country names from REST Countries API");
      return;
    }
    const countries = await response.json();
    for (const country of countries) {
      if (country.cca2 && country.name?.common) {
        COUNTRY_NAMES[country.cca2.toUpperCase()] = country.name.common;
      }
    }
  } catch (error) {
    console.error("Error fetching country names:", error);
  }
}

function getCountryName(code: string, fallback: string): string {
  const upperCode = code.toUpperCase();
  return COUNTRY_NAMES[upperCode] || fallback || code;
}

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

interface PackageInfo {
  packageCode: string;
  name: string;
  price: number; // API returns price * 10000
  currencyCode: string;
  volume: number; // bytes
  duration: number; // days
  location: string; // ISO code
  locationName?: string;
  activeType: number; // API returns as number, we convert to string
  description?: string;
}

interface PackageListResponse {
  errorCode: string;
  errorMsg?: string;
  obj: {
    packageList: PackageInfo[];
  };
}

// ============= Fetch Package by Code from eSIM Access API =============
export const fetchPackageFromApi = action({
  args: {
    clerkId: v.string(),
    packageCode: v.string()
  },
  handler: async (ctx, args) => {
    // Check admin status
    const isAdmin = await ctx.runQuery(internal.admin.checkIsAdminInternal, { clerkId: args.clerkId });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Fetch packages from API with the specific package code
    const bodyString = JSON.stringify({
      packageCode: args.packageCode,
    });
    const headers = getAuthHeaders(bodyString);

    const response = await fetch(`${API_BASE_URL}/api/v1/open/package/list`, {
      method: "POST",
      headers,
      body: bodyString,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: PackageListResponse = await response.json();

    if (data.errorCode && data.errorCode !== "0") {
      throw new Error(`API error: ${data.errorCode} - ${data.errorMsg || "Unknown error"}`);
    }

    const packages = data.obj?.packageList || [];

    if (packages.length === 0) {
      throw new Error(`Package not found: ${args.packageCode}`);
    }

    const pkg = packages[0];

    // Convert API price format (× 10,000) to cents
    const wholesaleCents = Math.round((pkg.price / 10000) * 100);
    // Apply 70% markup for retail price
    const retailCents = Math.ceil(wholesaleCents * 1.7);

    return {
      packageCode: pkg.packageCode,
      name: pkg.name,
      locationCode: pkg.location,
      locationName: pkg.locationName || pkg.location,
      price: wholesaleCents,
      retailPrice: retailCents,
      currencyCode: pkg.currencyCode || "USD",
      volume: pkg.volume,
      duration: pkg.duration,
      activeType: String(pkg.activeType),
      description: pkg.description,
    };
  },
});

// Helper to check if a location code represents a bundle
function isBundle(locationCode: string): boolean {
  if (locationCode.includes(",") || locationCode.includes("_") || locationCode.includes("-")) {
    return true;
  }
  if (locationCode.length > 2) {
    return true;
  }
  return false;
}

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
    RU: "Europe",
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
  if (code.length !== 2) return "🌍";
  const firstChar = code.charCodeAt(0) - 65 + 0x1F1E6;
  const secondChar = code.charCodeAt(1) - 65 + 0x1F1E6;
  return String.fromCodePoint(firstChar, secondChar);
}

// Popular countries that should be featured automatically
const POPULAR_COUNTRIES = new Set([
  "US", "GB", "JP", "KR", "TH", "FR", "DE", "IT", "ES", "AU",
  "CA", "SG", "NL", "CH", "AE", "HK", "TW", "MY", "ID", "VN",
  "PT", "GR", "TR", "MX", "BR", "NZ", "IE", "AT", "BE", "SE",
]);

// Known bundle names mapping
const BUNDLE_NAMES: Record<string, string> = {
  // Regional bundles
  "EU": "Europe",
  "EUROPE": "Europe",
  "AS": "Asia",
  "ASIA": "Asia",
  "AF": "Africa",
  "AFRICA": "Africa",
  "NA": "North America",
  "SA": "South America",
  "ME": "Middle East",
  "OC": "Oceania",
  "OCEANIA": "Oceania",
  "GLOBAL": "Global",
  "WORLD": "Worldwide",
  // Common multi-region codes
  "EU_AS": "Europe & Asia",
  "AS_EU": "Asia & Europe",
  "EU_NA": "Europe & North America",
  "APAC": "Asia Pacific",
  "EMEA": "Europe, Middle East & Africa",
  "LATAM": "Latin America",
  "CARIBBEAN": "Caribbean",
  "SCHENGEN": "Schengen Zone",
  "BALTIC": "Baltic States",
  "NORDIC": "Nordic Countries",
  "BALKANS": "Balkans",
  "GCC": "Gulf Countries",
  "ASEAN": "Southeast Asia",
  "CIS": "CIS Countries",
};

// Generate a friendly bundle name from a code
function getBundleName(code: string, apiName: string): string {
  // Check if we have a known name for this bundle
  const upperCode = code.toUpperCase();
  if (BUNDLE_NAMES[upperCode]) {
    return BUNDLE_NAMES[upperCode];
  }

  // If API provided a good name (not just the code), use it
  if (apiName && apiName !== code && apiName.length > 3 && !apiName.includes(",") && !apiName.includes("_")) {
    return apiName;
  }

  // Try to parse the code to create a name
  // Handle codes like "EU42" -> "Europe 42 Countries"
  const regionMatch = upperCode.match(/^([A-Z]+)(\d+)$/);
  if (regionMatch) {
    const [, region, count] = regionMatch;
    const regionName = BUNDLE_NAMES[region] || region;
    return `${regionName} ${count} Countries`;
  }

  // Handle comma-separated country codes like "DE,FR,IT"
  if (code.includes(",")) {
    const countries = code.split(",");
    if (countries.length <= 3) {
      // For 2-3 countries, list them
      const names = countries.map(c => COUNTRY_NAMES[c.toUpperCase()] || c).filter(Boolean);
      if (names.length > 0 && names.every(n => n.length > 2)) {
        return names.join(", ");
      }
    }
    return `${countries.length} Countries Bundle`;
  }

  // Handle underscore-separated codes like "EU_AS"
  if (code.includes("_")) {
    const parts = code.split("_");
    const names = parts.map(p => BUNDLE_NAMES[p.toUpperCase()] || p);
    return names.join(" & ");
  }

  // Fallback: use the API name or a formatted code
  return apiName || code;
}

// ============= Sync All Packages (Admin) =============
export const syncAllPackages = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(internal.admin.checkIsAdminInternal, { clerkId: args.clerkId });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Fetch country names from REST Countries API
    await fetchCountryNames();

    // Fetch all packages from API
    const bodyString = JSON.stringify({
      pager: {
        pageNum: 1,
        pageSize: 5000,
      },
    });
    const headers = getAuthHeaders(bodyString);

    const response = await fetch(`${API_BASE_URL}/api/v1/open/package/list`, {
      method: "POST",
      headers,
      body: bodyString,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: PackageListResponse = await response.json();

    if (data.errorCode && data.errorCode !== "0") {
      throw new Error(`API error: ${data.errorCode} - ${data.errorMsg || "Unknown error"}`);
    }

    const packages = data.obj?.packageList || [];
    let synced = 0;

    // Track countries/bundles to create
    const countryData: Record<string, { name: string; minPrice: number; count: number }> = {};

    for (const pkg of packages) {
      const wholesaleCents = Math.round((pkg.price / 10000) * 100);
      const retailCents = Math.ceil(wholesaleCents * 1.7);

      // Normalize location code
      const locationCode = isBundle(pkg.location)
        ? pkg.location
        : pkg.location.toUpperCase();

      await ctx.runMutation(internal.packages.upsertPackage, {
        packageCode: pkg.packageCode,
        name: pkg.name,
        locationCode: locationCode,
        locationName: pkg.locationName || pkg.location,
        price: wholesaleCents,
        retailPrice: retailCents,
        currencyCode: pkg.currencyCode || "USD",
        volume: pkg.volume,
        duration: pkg.duration,
        activeType: String(pkg.activeType),
        description: pkg.description,
      });

      // Track country/bundle data
      if (!countryData[locationCode]) {
        countryData[locationCode] = {
          name: pkg.locationName || pkg.location,
          minPrice: retailCents,
          count: 1,
        };
      } else {
        countryData[locationCode].count++;
        if (retailCents < countryData[locationCode].minPrice) {
          countryData[locationCode].minPrice = retailCents;
        }
      }

      synced++;
    }

    // Create/update countries and bundles
    let countriesCreated = 0;
    for (const [code, data] of Object.entries(countryData)) {
      const isBundleCode = isBundle(code);
      const upperCode = code.toUpperCase();

      // Use proper country name from REST Countries API for single countries
      // For bundles, generate a friendly name
      const countryName = isBundleCode
        ? getBundleName(code, data.name)
        : getCountryName(upperCode, data.name);

      await ctx.runMutation(internal.packages.upsertCountry, {
        code: code,
        name: countryName,
        region: isBundleCode ? "Bundle" : getRegionForCountry(code),
        flagEmoji: isBundleCode ? "🌐" : getFlagEmoji(code),
        minPrice: data.minPrice,
        packageCount: data.count,
        popular: !isBundleCode && POPULAR_COUNTRIES.has(upperCode),
      });

      countriesCreated++;
    }

    return { success: true, synced, countriesCreated };
  },
});

// ============= Get Merchant Balance (Admin) =============
export const getBalance = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(internal.admin.checkIsAdminInternal, { clerkId: args.clerkId });
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const bodyString = JSON.stringify({});
    const headers = getAuthHeaders(bodyString);

    const response = await fetch(`${API_BASE_URL}/api/v1/open/balance/query`, {
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

    // Convert from API format (×10,000) to dollars
    const balanceDollars = data.obj.balance / 10000;

    return {
      balance: data.obj.balance,
      balanceDollars,
      balanceCents: Math.round(balanceDollars * 100),
    };
  },
});
