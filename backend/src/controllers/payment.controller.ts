import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/apiResponse';

export class PaymentController {
  // Stripe
  static async createStripeIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, currency } = req.body;
      const result = await PaymentService.createStripePaymentIntent(orderId, currency);
      ApiResponse.created(res, result, 'Stripe PaymentIntent initialized with 100% DDP customs guarantee.');
    } catch (error) {
      next(error);
    }
  }

  static async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string | undefined;
      const rawBody = (req as any).rawBody || req.body;
      const result = await PaymentService.handleStripeWebhook(rawBody, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // PayPal
  static async createPayPalOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;
      const result = await PaymentService.createPayPalOrder(orderId);
      ApiResponse.created(res, result, 'PayPal order initialized.');
    } catch (error) {
      next(error);
    }
  }

  static async capturePayPalOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, paypalOrderId } = req.body;
      const result = await PaymentService.capturePayPalOrder(orderId, paypalOrderId);
      ApiResponse.success(res, result, 'PayPal payment captured successfully.');
    } catch (error) {
      next(error);
    }
  }

  // Razorpay
  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;
      const result = await PaymentService.createRazorpayOrder(orderId);
      ApiResponse.created(res, result, 'Razorpay domestic order created.');
    } catch (error) {
      next(error);
    }
  }

  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PaymentService.verifyRazorpayPayment(req.body);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

