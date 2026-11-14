import { z } from 'zod';

export const createReelSchema = z.object({
  episodeNumber: z
    .string()
    .trim()
    .min(1, 'Episode number is required (e.g., EPISODE 01)')
    .max(50, 'Episode number must be 50 characters or less'),
  title: z
    .string()
    .trim()
    .min(2, 'Reel title must be at least 2 characters')
    .max(200, 'Reel title must be 200 characters or less'),
  duration: z
    .string()
    .trim()
    .min(1, 'Duration is required (e.g., 04:15 MIN)')
    .max(50, 'Duration must be 50 characters or less')
    .default('01:00 MIN'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(2000, 'Description must be 2000 characters or less'),
  videoUrl: z.string().trim().url('A valid videoUrl is required'),
  thumbnailUrl: z
    .string()
    .trim()
    .url('thumbnailUrl must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const reelIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Reel ID is required'),
});

export type CreateReelInput = z.infer<typeof createReelSchema>;

