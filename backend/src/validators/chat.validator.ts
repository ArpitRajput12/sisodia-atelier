import { z } from 'zod';

export const chatMessageSchema = z
  .object({
    message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message exceeds 4000 characters'),
    countryCode: z.string().max(10).optional(),
    currencyCode: z.string().max(10).optional(),
    currencySymbol: z.string().max(10).optional(),
    conversionRate: z.number().optional(),
    sessionId: z.string().optional(),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'model']),
          content: z.string(),
        })
      )
      .optional(),
    liveCatalog: z.array(z.any()).optional(),
    isAuthenticated: z.boolean().optional(),
    userId: z.string().optional(),
    guestSessionId: z.string().optional(),
    stream: z.boolean().optional(),
  })
  .passthrough();

export const streamChatSchema = chatMessageSchema;
