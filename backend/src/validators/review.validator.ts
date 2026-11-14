import { z } from 'zod';

export const submitReviewSchema = z.object({
  patronName: z.string().min(2, 'Patron name must be at least 2 characters'),
  patronLocation: z.string().min(2, 'Location is required (e.g. Mayfair, London, UK)'),
  pieceTitle: z.string().min(2, 'Heirloom piece title is required'),
  rating: z.number().int().min(1).max(5).default(5),
  headline: z.string().min(3, 'Headline must be at least 3 characters'),
  commentary: z.string().min(10, 'Commentary must be at least 10 characters'),
  productId: z.string().uuid().optional(),
});

