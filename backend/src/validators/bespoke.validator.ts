import { z } from 'zod';
import { BespokeStatus, Currency, WoodSpecies } from '@prisma/client';

export const submitBespokeInquirySchema = z.object({
  patronName: z.string().min(2, 'Patron name is required'),
  patronEmail: z.string().email('Valid email address is required'),
  patronPhone: z.string().optional(),
  patronCountry: z.string().min(2, 'Patron country is required'),
  preferredCurrency: z.nativeEnum(Currency).default(Currency.USD),
  projectTitle: z.string().min(3, 'Project title or envisioned heirloom name is required'),
  woodPreference: z.nativeEnum(WoodSpecies).optional(),
  customDimensionsDesc: z.string().optional(),
  estimatedBudget: z.string().optional(),
  timeframeWeeks: z.number().int().min(1).optional(),
  architecturalDrawings: z.array(z.string().url()).optional(),
  specialNotes: z.string().min(10, 'Please describe your bespoke vision, architectural context, or requirements'),
});

export const updateBespokeStatusSchema = z.object({
  status: z.nativeEnum(BespokeStatus),
  conciergeNotes: z.string().optional(),
  estimatedQuoteAmount: z.number().positive().optional(),
});

export const bespokeQuerySchema = z.object({
  status: z.nativeEnum(BespokeStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

