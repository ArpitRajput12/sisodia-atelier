import { Request, Response, NextFunction } from 'express';
import { CurrencyService } from '../services/currency.service';
import { ApiResponse } from '../utils/apiResponse';
import { Currency } from '@prisma/client';

export class CurrencyController {
  static getSupportedCurrencies(_req: Request, res: Response, next: NextFunction): void {
    try {
      const data = CurrencyService.getSupportedCurrencies();
      ApiResponse.success(res, data, 'Supported luxury patron currencies & rates.');
    } catch (error) {
      next(error);
    }
  }

  static convert(req: Request, res: Response, next: NextFunction): void {
    try {
      const amount = Number(req.query.amount);
      const from = (req.query.from as Currency) || Currency.USD;
      const to = (req.query.to as Currency) || Currency.INR;

      if (isNaN(amount) || amount <= 0) {
        res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
        return;
      }

      const result = CurrencyService.convertAmount(amount, from, to);
      ApiResponse.success(res, result, 'Currency converted.');
    } catch (error) {
      next(error);
    }
  }
}

