import { z } from 'zod';
import { Currency } from '@prisma/client';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().min(1).default(1),
  customFinishing: z.string().optional(),
  customMonogram: z.string().max(30).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  customFinishing: z.string().optional(),
  customMonogram: z.string().max(30).optional(),
});

export const setCartCurrencySchema = z.object({
  currency: z.nativeEnum(Currency),
});

