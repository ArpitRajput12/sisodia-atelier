import { Currency } from '@prisma/client';
import { APP_CONSTANTS } from '../config/constants';
import {
  APPROVED_COUNTRY_CONFIGS,
  APPROVED_COUNTRY_CODES,
  isCountrySupported,
  resolveCountryConfig,
  SupportedCountryConfig,
} from '../config/currencies';

export {
  APPROVED_COUNTRY_CONFIGS,
  APPROVED_COUNTRY_CODES,
  isCountrySupported,
  resolveCountryConfig,
  SupportedCountryConfig,
};

export interface ConvertedPriceResult {
  amountINR: number;
  countryCode: string;
  countryName: string;
  currency: string;
  symbol: string;
  amount: number;
  formatted: string;
  inrExchangeRate: number;
  dutyPrepaidNote: string;
  toString: () => string;
}

/**
 * Exact INR-Base Multi-Currency Converter
 * Owner enters prices in INR (₹) at the Nagina Atelier floor.
 * Automatically converts to user's local currency based on approved exchange rates.
 */
export function convertFromINR(
  amountINR: number | string,
  countryCode: string = 'US'
): ConvertedPriceResult {
  const numericINR = typeof amountINR === 'string' ? parseFloat(amountINR) || 0 : amountINR;
  const config: SupportedCountryConfig = resolveCountryConfig(countryCode);
  const rate = config.inrExchangeRate > 0 ? config.inrExchangeRate : 1;
  const rawConverted = numericINR / rate;

  let roundedAmount: number;
  let formattedStr: string;

  if (config.currency === 'INR') {
    roundedAmount = Math.round(numericINR);
    formattedStr = `₹${roundedAmount.toLocaleString('en-IN')}`;
  } else {
    roundedAmount = Math.round(rawConverted * 100) / 100;
    formattedStr = `${config.symbol}${roundedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  const result: ConvertedPriceResult = {
    amountINR: numericINR,
    countryCode: config.countryCode,
    countryName: config.countryName,
    currency: config.currency,
    symbol: config.symbol,
    amount: roundedAmount,
    formatted: formattedStr,
    inrExchangeRate: rate,
    dutyPrepaidNote: config.dutyPrepaidNote,
    toString() {
      return formattedStr;
    },
  };

  return result;
}

/**
 * Backward-compatible CurrencyConverter utility used by cart & order calculations
 */
export class CurrencyConverter {
  private static rates: Record<Currency, number> = APP_CONSTANTS.ESTIMATED_EXCHANGE_RATES as any;

  /**
   * Convert amount from USD base to target currency
   */
  static fromUsd(amountUsd: number, targetCurrency: Currency): number {
    const rate = this.rates[targetCurrency] || 1;
    const converted = amountUsd * rate;
    return Math.round(converted * 100) / 100;
  }

  /**
   * Convert amount from INR base to target currency
   */
  static fromInr(amountInr: number, targetCurrency: Currency): number {
    const amountUsd = amountInr / this.rates.INR;
    return this.fromUsd(amountUsd, targetCurrency);
  }

  /**
   * Format amount with currency symbol
   */
  static format(amount: number, currency: Currency): string {
    const symbol = (APP_CONSTANTS.CURRENCY_SYMBOLS as any)[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Get current exchange rates snapshot
   */
  static getRates(): Record<Currency, number> {
    return { ...this.rates };
  }
}
