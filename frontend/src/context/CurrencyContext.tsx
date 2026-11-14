'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, CountryCurrencyConfig } from '../types';

/**
 * Strict 11 Approved Target Export Countries & Currencies
 * Base Currency: INR (₹) - Nagina Atelier Head Office
 */
export const COUNTRY_CURRENCY_CONFIGS: Record<string, CountryCurrencyConfig> = {
  US: {
    countryCode: 'US',
    countryName: 'USA',
    currencyCode: 'USD',
    symbol: '$',
    label: 'USA (USD $)',
    rateAgainstInr: 84.0,
    flag: '🇺🇸',
    dutyPrepaidNote: '100% Pre-Paid DDP to USA ($0 Doorstep Tariffs)',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'UK',
    currencyCode: 'GBP',
    symbol: '£',
    label: 'UK (GBP £)',
    rateAgainstInr: 107.0,
    flag: '🇬🇧',
    dutyPrepaidNote: '100% Pre-Paid DDP to UK (HMRC VAT Pre-Cleared)',
  },
  EU: {
    countryCode: 'EU',
    countryName: 'Europe',
    currencyCode: 'EUR',
    symbol: '€',
    label: 'Europe (EUR €)',
    rateAgainstInr: 91.0,
    flag: '🇪🇺',
    dutyPrepaidNote: '100% Pre-Paid DDP to EU Member States',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    currencyCode: 'AUD',
    symbol: 'A$',
    label: 'Australia (AUD A$)',
    rateAgainstInr: 55.0,
    flag: '🇦🇺',
    dutyPrepaidNote: '100% Pre-Paid DDP to Australia (Biosecurity Compliant)',
  },
  'AE-DU': {
    countryCode: 'AE-DU',
    countryName: 'Dubai',
    currencyCode: 'AED',
    symbol: 'AED ',
    label: 'Dubai (AED د.إ)',
    rateAgainstInr: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% Pre-Paid DDP to Dubai ($0 Doorstep Tariffs)',
  },
  DXB: {
    countryCode: 'AE-DU',
    countryName: 'Dubai',
    currencyCode: 'AED',
    symbol: 'AED ',
    label: 'Dubai (AED د.إ)',
    rateAgainstInr: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% Pre-Paid DDP to Dubai ($0 Doorstep Tariffs)',
  },
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    currencyCode: 'EUR',
    symbol: '€',
    label: 'Netherlands (EUR €)',
    rateAgainstInr: 91.0,
    flag: '🇳🇱',
    dutyPrepaidNote: '100% Pre-Paid DDP to Netherlands (Rotterdam/Schiphol Pre-Cleared)',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    currencyCode: 'EUR',
    symbol: '€',
    label: 'Germany (EUR €)',
    rateAgainstInr: 91.0,
    flag: '🇩🇪',
    dutyPrepaidNote: '100% Pre-Paid DDP to Germany (Frankfurt Air Freight Duty Pre-Paid)',
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    currencyCode: 'CAD',
    symbol: 'C$',
    label: 'Canada (CAD C$)',
    rateAgainstInr: 61.0,
    flag: '🇨🇦',
    dutyPrepaidNote: '100% Pre-Paid DDP to Canada (CBSA GST/HST Pre-Cleared)',
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    currencyCode: 'EUR',
    symbol: '€',
    label: 'France (EUR €)',
    rateAgainstInr: 91.0,
    flag: '🇫🇷',
    dutyPrepaidNote: '100% Pre-Paid DDP to France (Paris CDG White-Glove Handover)',
  },
  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    currencyCode: 'MXN',
    symbol: 'MX$',
    label: 'Mexico (MXN MX$)',
    rateAgainstInr: 4.2,
    flag: '🇲🇽',
    dutyPrepaidNote: '100% Pre-Paid DDP to Mexico (SAT Customs Pre-Cleared)',
  },
  AE: {
    countryCode: 'AE',
    countryName: 'UAE',
    currencyCode: 'AED',
    symbol: 'AED ',
    label: 'UAE (AED د.إ)',
    rateAgainstInr: 22.85,
    flag: '🇦🇪',
    dutyPrepaidNote: '100% Pre-Paid DDP to UAE (Dubai & Abu Dhabi Pre-Paid)',
  },
};

export const APPROVED_COUNTRY_LIST: CountryCurrencyConfig[] = [
  COUNTRY_CURRENCY_CONFIGS.US,
  COUNTRY_CURRENCY_CONFIGS.GB,
  COUNTRY_CURRENCY_CONFIGS.EU,
  COUNTRY_CURRENCY_CONFIGS.AU,
  COUNTRY_CURRENCY_CONFIGS['AE-DU'],
  COUNTRY_CURRENCY_CONFIGS.NL,
  COUNTRY_CURRENCY_CONFIGS.DE,
  COUNTRY_CURRENCY_CONFIGS.CA,
  COUNTRY_CURRENCY_CONFIGS.FR,
  COUNTRY_CURRENCY_CONFIGS.MX,
  COUNTRY_CURRENCY_CONFIGS.AE,
];

// Backward-compatibility map for legacy consumers expecting CURRENCY_CONFIGS
export const CURRENCY_CONFIGS: Record<string, any> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', rateAgainstUsd: 1.0, flag: '🇺🇸' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', rateAgainstUsd: 0.79, flag: '🇬🇧' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', rateAgainstUsd: 0.92, flag: '🇪🇺' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', rateAgainstUsd: 1.53, flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', label: 'CAD (C$)', rateAgainstUsd: 1.38, flag: '🇨🇦' },
  MXN: { code: 'MXN', symbol: 'MX$', label: 'MXN (MX$)', rateAgainstUsd: 20.0, flag: '🇲🇽' },
  AED: { code: 'AED', symbol: 'AED ', label: 'AED (د.إ)', rateAgainstUsd: 3.67, flag: '🇦🇪' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', rateAgainstUsd: 84.0, flag: '🇮🇳' },
};

interface CurrencyContextType {
  selectedCountry: string; // 'US', 'GB', 'EU', 'NL', etc.
  setSelectedCountry: (countryCode: string) => void;
  countryConfig: CountryCurrencyConfig;
  formatPriceFromINR: (priceInINR: number | string) => string;
  convertPriceFromINR: (priceInINR: number | string) => number;
  availableCountries: CountryCurrencyConfig[];

  // Backward compatibility with legacy CurrencyContext
  currency: Currency;
  setCurrency: (currency: Currency | string) => void;
  config: any;
  formatPrice: (amountInUsd: number) => string;
  convertPrice: (amountInUsd: number) => number;
  availableCurrencies: any[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<string>('US');

  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem('sisodia_preferred_country');
      if (savedCountry && COUNTRY_CURRENCY_CONFIGS[savedCountry]) {
        setSelectedCountryState(savedCountry);
        return;
      }
      const legacyCurrency = localStorage.getItem('sisodia_preferred_currency');
      if (legacyCurrency) {
        const found = Object.values(COUNTRY_CURRENCY_CONFIGS).find(
          (c) => c.currencyCode === legacyCurrency
        );
        if (found) {
          setSelectedCountryState(found.countryCode);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setSelectedCountry = (countryCode: string) => {
    const validCode = COUNTRY_CURRENCY_CONFIGS[countryCode] ? countryCode : 'US';
    setSelectedCountryState(validCode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sisodia_preferred_country', validCode);
        localStorage.setItem(
          'sisodia_preferred_currency',
          COUNTRY_CURRENCY_CONFIGS[validCode].currencyCode
        );
      } catch {
        // Ignore quota
      }
    }
  };

  const setCurrency = (c: Currency | string) => {
    const match = Object.values(COUNTRY_CURRENCY_CONFIGS).find(
      (cfg) => cfg.countryCode === c || cfg.currencyCode === c
    );
    if (match) {
      setSelectedCountry(match.countryCode);
    }
  };

  const currentCountryConfig =
    COUNTRY_CURRENCY_CONFIGS[selectedCountry] || COUNTRY_CURRENCY_CONFIGS.US;

  /**
   * Helper: Format exact localized price from Base INR (₹)
   * e.g. ₹84,000 => USA: $1,000 | UK: £785 | UAE: AED 3,676 | India: ₹84,000
   */
  const formatPriceFromINR = (priceInINR: number | string): string => {
    const numericInr = typeof priceInINR === 'string' ? parseFloat(priceInINR) || 0 : priceInINR || 0;

    if (currentCountryConfig.countryCode === 'IN') {
      const rounded = Math.round(numericInr);
      return `₹${rounded.toLocaleString('en-IN')}`;
    }

    const rate = currentCountryConfig.rateAgainstInr > 0 ? currentCountryConfig.rateAgainstInr : 1;
    const rawConverted = numericInr / rate;
    const rounded = Math.round(rawConverted);

    return `${currentCountryConfig.symbol}${rounded.toLocaleString('en-US')}`;
  };

  /**
   * Helper: Numeric conversion from Base INR (₹)
   */
  const convertPriceFromINR = (priceInINR: number | string): number => {
    const numericInr = typeof priceInINR === 'string' ? parseFloat(priceInINR) || 0 : priceInINR || 0;
    if (currentCountryConfig.countryCode === 'IN') {
      return Math.round(numericInr);
    }
    const rate = currentCountryConfig.rateAgainstInr > 0 ? currentCountryConfig.rateAgainstInr : 1;
    return Math.round(numericInr / rate);
  };

  /**
   * Backward-compatible formatPrice:
   * Handles USD inputs by converting to INR (USD * 84) and formatting
   */
  const formatPrice = (amountInUsd: number): string => {
    const equivalentInr = (amountInUsd || 0) * 84;
    return formatPriceFromINR(equivalentInr);
  };

  const convertPrice = (amountInUsd: number): number => {
    const equivalentInr = (amountInUsd || 0) * 84;
    return convertPriceFromINR(equivalentInr);
  };

  // Legacy config adapter so components expecting `config.symbol` or `config.flag` don't break
  const legacyConfig = {
    code: currentCountryConfig.currencyCode,
    countryCode: currentCountryConfig.countryCode,
    symbol: currentCountryConfig.symbol,
    label: currentCountryConfig.label,
    flag: currentCountryConfig.flag,
    rateAgainstUsd: 84 / currentCountryConfig.rateAgainstInr,
  };

  // Legacy availableCurrencies adapter mapped to 11 countries
  const availableCurrencies = APPROVED_COUNTRY_LIST.map((c) => ({
    code: c.countryCode,
    countryCode: c.countryCode,
    currencyCode: c.currencyCode,
    symbol: c.symbol,
    label: c.label,
    flag: c.flag,
    rateAgainstInr: c.rateAgainstInr,
  }));

  return (
    <CurrencyContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        countryConfig: currentCountryConfig,
        formatPriceFromINR,
        convertPriceFromINR,
        availableCountries: APPROVED_COUNTRY_LIST,
        currency: currentCountryConfig.currencyCode as Currency,
        setCurrency,
        config: legacyConfig,
        formatPrice,
        convertPrice,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
