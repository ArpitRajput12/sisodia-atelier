// ==============================================================================
// SISODIA ATELIER ✧ - STRICT 11 EXPORT COUNTRIES & CURRENCIES
// Internal Base Currency: INR (₹) - Nagina, India Atelier Head Office
// ==============================================================================

export interface SupportedCountryConfig {
  countryCode: string;
  countryName: string;
  currency: string;
  symbol: string;
  inrExchangeRate: number; // 1 unit of foreign currency = X INR
  flag: string;
  dutyPrepaidNote: string;
}

/**
 * Strict 11 Approved Target Export Countries.
 * 1. US - USA (USD $) - rate: 84.0 INR
 * 2. GB - UK (GBP £) - rate: 107.0 INR
 * 3. EU - Europe (EUR €) - rate: 91.0 INR
 * 4. AU - Australia (AUD A$) - rate: 55.0 INR
 * 5. AE-DU - Dubai (AED د.إ) - rate: 22.85 INR
 * 6. NL - Netherlands (EUR €) - rate: 91.0 INR
 * 7. DE - Germany (EUR €) - rate: 91.0 INR
 * 8. CA - Canada (CAD C$) - rate: 61.0 INR
 * 9. FR - France (EUR €) - rate: 91.0 INR
 * 10. MX - Mexico (MXN MX$) - rate: 4.2 INR
 * 11. AE - UAE (AED د.إ) - rate: 22.85 INR
 */
export const APPROVED_COUNTRY_CONFIGS: Record<string, SupportedCountryConfig> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    symbol: '$',
    inrExchangeRate: 84.0,
    flag: '🇺🇸',
    dutyPrepaidNote: '100% DDP - Zero US Customs Tariffs at Doorstep',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    inrExchangeRate: 107.0,
    flag: '🇬🇧',
    dutyPrepaidNote: '100% DDP - UK HMRC VAT & Import Customs Pre-Cleared',
  },
  EU: {
    countryCode: 'EU',
    countryName: 'Europe',
    currency: 'EUR',
    symbol: '€',
    inrExchangeRate: 91.0,
    flag: '🇪🇺',
    dutyPrepaidNote: '100% DDP - Pre-Cleared for all EU Member States',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    inrExchangeRate: 55.0,
    flag: '🇦🇺',
    dutyPrepaidNote: '100% DDP - Australian Biosecurity & CITES Compliant',
  },
  'AE-DU': {
    countryCode: 'AE-DU',
    countryName: 'Dubai',
    currency: 'AED',
    symbol: 'AED ',
    inrExchangeRate: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% DDP - Dubai Customs Pre-Paid ($0 Doorstep Tariffs)',
  },
  DXB: {
    countryCode: 'AE-DU',
    countryName: 'Dubai',
    currency: 'AED',
    symbol: 'AED ',
    inrExchangeRate: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% DDP - Dubai Customs Pre-Paid ($0 Doorstep Tariffs)',
  },
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    currency: 'EUR',
    symbol: '€',
    inrExchangeRate: 91.0,
    flag: '🇳🇱',
    dutyPrepaidNote: '100% DDP - Rotterdam/Schiphol Customs Pre-Cleared',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    currency: 'EUR',
    symbol: '€',
    inrExchangeRate: 91.0,
    flag: '🇩🇪',
    dutyPrepaidNote: '100% DDP - Frankfurt Air Freight Duty Pre-Paid',
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    inrExchangeRate: 61.0,
    flag: '🇨🇦',
    dutyPrepaidNote: '100% DDP - Canadian CBSA GST/HST Pre-Cleared',
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    currency: 'EUR',
    symbol: '€',
    inrExchangeRate: 91.0,
    flag: '🇫🇷',
    dutyPrepaidNote: '100% DDP - Paris CDG Pre-Cleared White-Glove Handover',
  },
  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    currency: 'MXN',
    symbol: 'MX$',
    inrExchangeRate: 4.2,
    flag: '🇲🇽',
    dutyPrepaidNote: '100% DDP - Mexico SAT Customs Pre-Cleared',
  },
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    currency: 'AED',
    symbol: 'AED ',
    inrExchangeRate: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% DDP - Dubai & Abu Dhabi Customs Pre-Paid',
  },
};

export const APPROVED_COUNTRY_CODES = [
  'US',
  'GB',
  'EU',
  'AU',
  'AE-DU',
  'NL',
  'DE',
  'CA',
  'FR',
  'MX',
  'AE',
];

export const APPROVED_COUNTRY_NAMES = [
  'United States',
  'United Kingdom',
  'Europe',
  'Australia',
  'Dubai',
  'Netherlands',
  'Germany',
  'Canada',
  'France',
  'Mexico',
  'United Arab Emirates',
];

export function isCountrySupported(countryIdentifier?: string): boolean {
  if (!countryIdentifier) return false;
  const normalized = countryIdentifier.trim().toUpperCase();
  if (APPROVED_COUNTRY_CODES.includes(normalized) || normalized === 'DXB') return true;

  return Object.values(APPROVED_COUNTRY_CONFIGS).some(
    (c) => c.countryName.toUpperCase() === normalized
  );
}

export function resolveCountryConfig(countryIdentifier?: string): SupportedCountryConfig {
  if (!countryIdentifier) return APPROVED_COUNTRY_CONFIGS.US;
  const normalized = countryIdentifier.trim().toUpperCase();

  if (APPROVED_COUNTRY_CONFIGS[normalized]) {
    return APPROVED_COUNTRY_CONFIGS[normalized];
  }

  const byName = Object.values(APPROVED_COUNTRY_CONFIGS).find(
    (c) => c.countryName.toUpperCase() === normalized
  );
  if (byName) return byName;

  return APPROVED_COUNTRY_CONFIGS.US;
}
