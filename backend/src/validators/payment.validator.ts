import { z } from 'zod';
import { Currency } from '@prisma/client';

export const createStripeIntentSchema = z.object({
  orderId: z.string().uuid('Valid order UUID is required'),
  currency: z.nativeEnum(Currency).optional(),
});

export const createPayPalOrderSchema = z.object({
  orderId: z.string().uuid('Valid order UUID is required'),
});

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().uuid('Valid order UUID is required'),
  paypalOrderId: z.string().min(1, 'PayPal Order ID is required'),
});

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().uuid('Valid order UUID is required'),
});

export const verifyRazorpaySchema = z.object({
  orderId: z.string().uuid('Valid order UUID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay cryptographic signature is required'),
});

