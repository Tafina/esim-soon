"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac, randomUUID } from "crypto";

// ============= eSIM Access API Client =============

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

function getCountryNameFromApi(code: string, fallback: string): string {
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
  price: number;
  currencyCode: string;
  volume: number;
  duration: number;
  location: string;
  locationCode: string;
  activeType: string;
  description?: string;
}

interface PackageListResponse {
  errorCode: string;
  errorMsg?: string;
  obj: {
    packageList: PackageInfo[];
  };
}

async function getPackageList(locationCode?: string): Promise<PackageInfo[]> {
  const body = locationCode ? { locationCode } : {};
  const bodyString = JSON.stringify(body);
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

  return data.obj.packageList;
}

function apiPriceToCents(apiPrice: number): number {
  return Math.round((apiPrice / 10000) * 100);
}

// ============= Constants =============

const MARKUP_PERCENTAGE = 70;

const COUNTRY_DATA: Record<string, { name: string; region: string; flagEmoji: string; popular?: boolean }> = {
  US: { name: "United States", region: "Americas", flagEmoji: "\u{1F1FA}\u{1F1F8}", popular: true },
  GB: { name: "United Kingdom", region: "Europe", flagEmoji: "\u{1F1EC}\u{1F1E7}", popular: true },
  JP: { name: "Japan", region: "Asia", flagEmoji: "\u{1F1EF}\u{1F1F5}", popular: true },
  KR: { name: "South Korea", region: "Asia", flagEmoji: "\u{1F1F0}\u{1F1F7}", popular: true },
  TH: { name: "Thailand", region: "Asia", flagEmoji: "\u{1F1F9}\u{1F1ED}", popular: true },
  FR: { name: "France", region: "Europe", flagEmoji: "\u{1F1EB}\u{1F1F7}", popular: true },
  DE: { name: "Germany", region: "Europe", flagEmoji: "\u{1F1E9}\u{1F1EA}", popular: true },
  IT: { name: "Italy", region: "Europe", flagEmoji: "\u{1F1EE}\u{1F1F9}", popular: true },
  ES: { name: "Spain", region: "Europe", flagEmoji: "\u{1F1EA}\u{1F1F8}", popular: true },
  AU: { name: "Australia", region: "Oceania", flagEmoji: "\u{1F1E6}\u{1F1FA}", popular: true },
  CA: { name: "Canada", region: "Americas", flagEmoji: "\u{1F1E8}\u{1F1E6}", popular: true },
  SG: { name: "Singapore", region: "Asia", flagEmoji: "\u{1F1F8}\u{1F1EC}", popular: true },
  CN: { name: "China", region: "Asia", flagEmoji: "\u{1F1E8}\u{1F1F3}" },
  HK: { name: "Hong Kong", region: "Asia", flagEmoji: "\u{1F1ED}\u{1F1F0}" },
  TW: { name: "Taiwan", region: "Asia", flagEmoji: "\u{1F1F9}\u{1F1FC}" },
  VN: { name: "Vietnam", region: "Asia", flagEmoji: "\u{1F1FB}\u{1F1F3}" },
  MY: { name: "Malaysia", region: "Asia", flagEmoji: "\u{1F1F2}\u{1F1FE}" },
  ID: { name: "Indonesia", region: "Asia", flagEmoji: "\u{1F1EE}\u{1F1E9}" },
  PH: { name: "Philippines", region: "Asia", flagEmoji: "\u{1F1F5}\u{1F1ED}" },
  IN: { name: "India", region: "Asia", flagEmoji: "\u{1F1EE}\u{1F1F3}" },
  NL: { name: "Netherlands", region: "Europe", flagEmoji: "\u{1F1F3}\u{1F1F1}" },
  BE: { name: "Belgium", region: "Europe", flagEmoji: "\u{1F1E7}\u{1F1EA}" },
  CH: { name: "Switzerland", region: "Europe", flagEmoji: "\u{1F1E8}\u{1F1ED}" },
  AT: { name: "Austria", region: "Europe", flagEmoji: "\u{1F1E6}\u{1F1F9}" },
  PT: { name: "Portugal", region: "Europe", flagEmoji: "\u{1F1F5}\u{1F1F9}" },
  GR: { name: "Greece", region: "Europe", flagEmoji: "\u{1F1EC}\u{1F1F7}" },
  TR: { name: "Turkey", region: "Europe", flagEmoji: "\u{1F1F9}\u{1F1F7}" },
  PL: { name: "Poland", region: "Europe", flagEmoji: "\u{1F1F5}\u{1F1F1}" },
  CZ: { name: "Czech Republic", region: "Europe", flagEmoji: "\u{1F1E8}\u{1F1FF}" },
  SE: { name: "Sweden", region: "Europe", flagEmoji: "\u{1F1F8}\u{1F1EA}" },
  NO: { name: "Norway", region: "Europe", flagEmoji: "\u{1F1F3}\u{1F1F4}" },
  DK: { name: "Denmark", region: "Europe", flagEmoji: "\u{1F1E9}\u{1F1F0}" },
  FI: { name: "Finland", region: "Europe", flagEmoji: "\u{1F1EB}\u{1F1EE}" },
  IE: { name: "Ireland", region: "Europe", flagEmoji: "\u{1F1EE}\u{1F1EA}" },
  NZ: { name: "New Zealand", region: "Oceania", flagEmoji: "\u{1F1F3}\u{1F1FF}" },
  MX: { name: "Mexico", region: "Americas", flagEmoji: "\u{1F1F2}\u{1F1FD}" },
  BR: { name: "Brazil", region: "Americas", flagEmoji: "\u{1F1E7}\u{1F1F7}" },
  AR: { name: "Argentina", region: "Americas", flagEmoji: "\u{1F1E6}\u{1F1F7}" },
  CL: { name: "Chile", region: "Americas", flagEmoji: "\u{1F1E8}\u{1F1F1}" },
  CO: { name: "Colombia", region: "Americas", flagEmoji: "\u{1F1E8}\u{1F1F4}" },
  AE: { name: "United Arab Emirates", region: "Middle East", flagEmoji: "\u{1F1E6}\u{1F1EA}" },
  SA: { name: "Saudi Arabia", region: "Middle East", flagEmoji: "\u{1F1F8}\u{1F1E6}" },
  IL: { name: "Israel", region: "Middle East", flagEmoji: "\u{1F1EE}\u{1F1F1}" },
  EG: { name: "Egypt", region: "Africa", flagEmoji: "\u{1F1EA}\u{1F1EC}" },
  ZA: { name: "South Africa", region: "Africa", flagEmoji: "\u{1F1FF}\u{1F1E6}" },
  MA: { name: "Morocco", region: "Africa", flagEmoji: "\u{1F1F2}\u{1F1E6}" },
  RU: { name: "Russia", region: "Europe", flagEmoji: "\u{1F1F7}\u{1F1FA}" },
};

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

// Check if a location code represents a bundle (multiple countries or regional)
function isBundle(locationCode: string): boolean {
  // Has separators (multiple countries)
  if (locationCode.includes(",") || locationCode.includes("_") || locationCode.includes("-")) {
    return true;
  }
  // Longer than 2 characters (not a standard ISO country code)
  if (locationCode.length > 2) {
    return true;
  }
  return false;
}

// Known bundle names mapping
const BUNDLE_NAMES: Record<string, string> = {
  "EU": "Europe", "EUROPE": "Europe",
  "AS": "Asia", "ASIA": "Asia",
  "AF": "Africa", "AFRICA": "Africa",
  "NA": "North America", "SA": "South America",
  "ME": "Middle East", "OC": "Oceania", "OCEANIA": "Oceania",
  "GLOBAL": "Global", "WORLD": "Worldwide",
  "EU_AS": "Europe & Asia", "AS_EU": "Asia & Europe",
  "APAC": "Asia Pacific", "EMEA": "Europe, Middle East & Africa",
  "LATAM": "Latin America", "CARIBBEAN": "Caribbean",
  "SCHENGEN": "Schengen Zone", "NORDIC": "Nordic Countries",
  "ASEAN": "Southeast Asia", "GCC": "Gulf Countries",
};

function getBundleName(code: string, apiName: string): string {
  const upperCode = code.toUpperCase();
  if (BUNDLE_NAMES[upperCode]) return BUNDLE_NAMES[upperCode];

  if (apiName && apiName !== code && apiName.length > 3 && !apiName.includes(",") && !apiName.includes("_")) {
    return apiName;
  }

  const regionMatch = upperCode.match(/^([A-Z]+)(\d+)$/);
  if (regionMatch) {
    const [, region, count] = regionMatch;
    return `${BUNDLE_NAMES[region] || region} ${count} Countries`;
  }

  if (code.includes(",")) {
    const countries = code.split(",");
    if (countries.length <= 3) {
      const names = countries.map(c => COUNTRY_NAMES[c.toUpperCase()] || c).filter(Boolean);
      if (names.length > 0 && names.every(n => n.length > 2)) return names.join(", ");
    }
    return `${countries.length} Countries Bundle`;
  }

  if (code.includes("_")) {
    const parts = code.split("_");
    return parts.map(p => BUNDLE_NAMES[p.toUpperCase()] || p).join(" & ");
  }

  return apiName || code;
}

function getCountryInfo(code: string, name?: string): { name: string; region: string; flagEmoji: string; popular?: boolean } {
  // Check if it's a bundle
  if (isBundle(code)) {
    return {
      name: getBundleName(code, name || ""),
      region: "Bundle",
      flagEmoji: "🌐",
    };
  }

  const upperCode = code.toUpperCase();

  // Try to get proper name from REST Countries API first
  const properName = getCountryNameFromApi(upperCode, name || "");

  if (COUNTRY_DATA[code]) {
    return {
      ...COUNTRY_DATA[code],
      name: properName || COUNTRY_DATA[code].name,
    };
  }

  // Auto-generate country info with proper name
  return {
    name: properName || name || code,
    region: getRegionForCountry(upperCode),
    flagEmoji: getFlagEmoji(upperCode),
  };
}

// ============= Action =============

export const syncPackages = action({
  args: { locationCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Fetch country names from REST Countries API first
    await fetchCountryNames();

    const packages = await getPackageList(args.locationCode);

    const countryPrices: Record<string, { minPrice: number; count: number; name: string }> = {};

    for (const pkg of packages) {
      const wholesaleCents = apiPriceToCents(pkg.price);
      const retailCents = Math.round(wholesaleCents * (1 + MARKUP_PERCENTAGE / 100));

      // Normalize location code - keep original for bundles, uppercase for single countries
      const normalizedCode = isBundle(pkg.locationCode)
        ? pkg.locationCode
        : pkg.locationCode.toUpperCase();

      await ctx.runMutation(internal.packages.upsertPackage, {
        packageCode: pkg.packageCode,
        name: pkg.name,
        locationCode: normalizedCode,
        locationName: pkg.location,
        price: wholesaleCents,
        retailPrice: retailCents,
        currencyCode: pkg.currencyCode,
        volume: pkg.volume,
        duration: pkg.duration,
        activeType: String(pkg.activeType),
        description: pkg.description,
      });

      if (!countryPrices[normalizedCode]) {
        countryPrices[normalizedCode] = {
          minPrice: retailCents,
          count: 1,
          name: pkg.location,
        };
      } else {
        countryPrices[normalizedCode].minPrice = Math.min(
          countryPrices[normalizedCode].minPrice,
          retailCents
        );
        countryPrices[normalizedCode].count++;
      }
    }

    for (const [code, data] of Object.entries(countryPrices)) {
      const countryInfo = getCountryInfo(code, data.name);
      await ctx.runMutation(internal.packages.upsertCountry, {
        code,
        name: countryInfo.name,
        region: countryInfo.region,
        flagEmoji: countryInfo.flagEmoji,
        minPrice: data.minPrice,
        packageCount: data.count,
        popular: countryInfo.popular,
      });
    }

    return { synced: packages.length, countries: Object.keys(countryPrices).length };
  },
});
