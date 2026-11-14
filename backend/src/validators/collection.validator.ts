import { z } from 'zod';

export const createCollectionSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(3),
  subtitle: z.string().optional(),
  narrative: z.string().min(10),
  heroImage: z.string().url().optional(),
  isCurated: z.boolean().default(true),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const manageCollectionProductsSchema = z.object({
  productIds: z.array(z.string().uuid()),
});

