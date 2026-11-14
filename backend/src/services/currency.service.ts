import { Currency } from '@prisma/client';
import { CurrencyConverter, convertFromINR } from '../utils/currency';
import { APP_CONSTANTS } from '../config/constants';
import { APPROVED_COUNTRY_CONFIGS } from '../config/currencies';

export class CurrencyService {
  /**
   * Get supported currencies, countries, and baseline rates
   */
  static getSupportedCurrencies() {
    return {
      defaultCurrency: 'USD',
      baseCurrency: 'INR',
      supported: APP_CONSTANTS.SUPPORTED_CURRENCIES,
      symbols: APP_CONSTANTS.CURRENCY_SYMBOLS,
      exchangeRates: CurrencyConverter.getRates(),
      approvedCountries: APPROVED_COUNTRY_CONFIGS,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Convert from INR to target approved country currency
   */
  static convertFromInr(amountInr: number, countryCode: string = 'US') {
    return convertFromINR(amountInr, countryCode);
  }

  /**
   * Convert an arbitrary amount between supported currencies
   */
  static convertAmount(amount: number, from: Currency, to: Currency): {
    amount: number;
    from: Currency;
    to: Currency;
    convertedAmount: number;
    formatted: string;
  } {
    let amountUsd = amount;
    const rates = CurrencyConverter.getRates();

    if (from !== Currency.USD) {
      amountUsd = amount / (rates[from] || 1);
    }

    const convertedAmount = CurrencyConverter.fromUsd(amountUsd, to);

    return {
      amount,
      from,
      to,
      convertedAmount,
      formatted: CurrencyConverter.format(convertedAmount, to),
    };
  }
}

