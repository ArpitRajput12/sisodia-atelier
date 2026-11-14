import { z } from 'zod';
import { WoodSpecies, CratingType, Currency } from '@prisma/client';

export const productQuerySchema = z.object({
  category: z.string().trim().optional(),
  woodSpecies: z.nativeEnum(WoodSpecies).optional(),
  currency: z.nativeEnum(Currency).optional().default(Currency.USD),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isFeatured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isMadeToOrder: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'lead_time', 'relevance'])
    .default('newest'),
});

const dimensionsSchema = z.object({
  length: z.coerce.number().positive('Length must be greater than zero'),
  width: z.coerce.number().positive('Width must be greater than zero'),
  height: z.coerce.number().positive('Height must be greater than zero'),
  unit: z.enum(['cm', 'inch']).default('cm'),
});

export const createProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  sku: z.string().trim().min(2).optional(),
  title: z.string().trim().min(2, 'Product title is required'),
  tagline: z.string().trim().optional(),
  shortDescription: z.string().trim().min(2).optional(),
  fullDescription: z.string().trim().min(2).optional(),
  category: z.string().trim().min(1).optional(),
  customCategory: z.string().trim().optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  woodSpecies: z.nativeEnum(WoodSpecies).default(WoodSpecies.ROYAL_SHEESHAM),
  secondaryMaterials: z.string().optional(),
  dimensionsCm: dimensionsSchema.optional(),
  cratedDimensionsCm: dimensionsSchema.optional(),
  netWeightKg: z.coerce.number().positive().optional(),
  grossCratedWeightKg: z.coerce.number().positive().optional(),
  finishType: z.string().trim().min(2).optional(),
  brassInlayDetails: z.string().optional(),
  artisanMasterName: z.string().optional(),
  provenanceHeritage: z.string().optional(),
  leadTimeWeeks: z.coerce.number().int().min(1).default(4),
  stockQuantity: z.coerce.number().int().min(0).default(1),
  isMadeToOrder: z.boolean().default(true),
  isHeirloomCertified: z.boolean().default(true),
  cratingType: z
    .nativeEnum(CratingType)
    .default(CratingType.WHITE_GLOVE_MUSEUM_CASE),
  hsTariffCode: z.string().default('9403.60.00'),
  price: z.coerce.number().positive().optional(),
  basePriceInr: z.coerce.number().positive().optional(),
  priceUsd: z.coerce.number().positive().optional(),
  priceGbp: z.coerce.number().positive().optional(),
  priceEur: z.coerce.number().positive().optional(),
  priceAed: z.coerce.number().positive().optional(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().trim().url().optional(),
  imageUrls: z.array(z.string().trim().url()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().trim().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        displayRank: z.number().int().default(0),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const toggleStarSchema = z.object({
  isFeatured: z.boolean().optional(),
});
