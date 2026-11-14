import { z } from 'zod';
import { Currency, OrderStatus, PaymentProvider, PaymentStatus } from '@prisma/client';

const addressSchema = z.object({
  fullName: z.string().min(2),
  companyName: z.string().optional(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  stateProvince: z.string().min(2),
  postalCode: z.string().min(2),
  countryCode: z
    .string()
    .length(2, 'Two-letter ISO country code (e.g. US, GB, AE, IN)'),
  phoneNumber: z.string().min(5),
  vatTaxNumber: z.string().optional(),
});

export const createOrderSchema = z
  .object({
    currency: z.nativeEnum(Currency).default(Currency.USD),
    paymentProvider: z.nativeEnum(PaymentProvider).default(PaymentProvider.STRIPE),
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().optional(),
    shippingAddress: addressSchema.optional(),
    billingAddress: addressSchema.optional(),
    patronNotes: z.string().optional(),
  })
  .passthrough();

export const updateOrderTrackingSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  orderStatus: z.nativeEnum(OrderStatus).optional(),
  trackingStage: z.coerce.number().int().min(1).max(6).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  courierPartner: z.string().trim().max(120).optional(),
  carrierName: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  currentCheckpoint: z.string().trim().max(300).optional(),
  estimatedDelivery: z.string().trim().max(150).optional(),
  citesPermitNumber: z.string().optional(),
  fittingsCertificateUrl: z.string().url().optional(),
  atelierNotes: z.string().optional(),
});

export const updateOrderStatusSchema = updateOrderTrackingSchema;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
  cancellationReason: z.string().trim().max(1000).optional(),
});

export const orderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  cancelledOnly: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
