/**
 * ==============================================================================
 * SISODIA ATELIER ✧ - APPROVED EXPORT TERRITORIES & IP GEOLOCATION CONFIGURATION
 * ==============================================================================
 * Client accounts, registration, and authentication are strictly restricted
 * exclusively to 11 approved international export territories.
 */

export interface ApprovedTerritory {
  code: string; // Internal territory code ('US', 'GB', 'EU', 'AU', 'AE-DU', etc.)
  name: string;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
}

export const APPROVED_TERRITORIES: Record<string, ApprovedTerritory> = {
  US: {
    code: 'US',
    name: 'USA',
    currencyCode: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
  },
  GB: {
    code: 'GB',
    name: 'UK',
    currencyCode: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
  },
  EU: {
    code: 'EU',
    name: 'Europe',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇪🇺',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
  },
  'AE-DU': {
    code: 'AE-DU',
    name: 'Dubai',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    flag: '🇦🇪',
  },
  DXB: {
    code: 'AE-DU',
    name: 'Dubai',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    flag: '🇦🇪',
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇳🇱',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇩🇪',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    flag: '🇨🇦',
  },
  FR: {
    code: 'FR',
    name: 'France',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇫🇷',
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    currencyCode: 'MXN',
    currencySymbol: 'MX$',
    flag: '🇲🇽',
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    flag: '🇦🇪',
  },
};

/**
 * Approved ISO-3166-1 Alpha-2 IP geolocation country codes.
 * Covers US, GB, AU, AE, NL, DE, CA, FR, MX plus EU Member States + EFTA.
 */
export const ALLOWED_IP_COUNTRY_CODES: Set<string> = new Set([
  'US', // United States
  'GB', // United Kingdom
  'AU', // Australia
  'AE', // United Arab Emirates (Dubai, Abu Dhabi, etc.)
  'NL', // Netherlands
  'DE', // Germany
  'CA', // Canada
  'FR', // France
  'MX', // Mexico
  // European Union & EFTA member states:
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  'CH', // Switzerland
  'NO', // Norway
]);

export const UNAUTHORIZED_COUNTRY_MESSAGE =
  'Sorry, client login and registration are currently available only for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.';

/**
 * Checks if a territory code (e.g. 'US', 'GB', 'EU', 'NL', 'AE-DU') is approved.
 */
export function isApprovedTerritoryCode(code?: string | null): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return Boolean(APPROVED_TERRITORIES[upper]);
}

/**
 * Checks if an IP country code (ISO-3166-1 Alpha-2, e.g. 'US', 'IN', 'FR') is approved.
 */
export function isApprovedIpCountry(isoCode?: string | null): boolean {
  if (!isoCode) return false;
  return ALLOWED_IP_COUNTRY_CODES.has(isoCode.trim().toUpperCase());
}

/**
 * Map an ISO-3166-1 Alpha-2 IP country code to a canonical approved territory.
 * Returns null if the ISO code is not part of the approved territories.
 */
export function resolveTerritoryFromIso(isoCode?: string | null): ApprovedTerritory | null {
  if (!isoCode) return null;
  const upper = isoCode.trim().toUpperCase();

  if (APPROVED_TERRITORIES[upper]) {
    return APPROVED_TERRITORIES[upper];
  }

  // European countries map to EU
  if (ALLOWED_IP_COUNTRY_CODES.has(upper)) {
    return APPROVED_TERRITORIES.EU;
  }

  return null;
}
