import { z } from 'zod';

export const createInquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Patron name must be at least 2 characters')
    .max(150, 'Patron name must be 150 characters or less'),
  contactInfo: z
    .string()
    .trim()
    .max(200, 'Contact info must be 200 characters or less')
    .optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  requirementType: z.string().trim().max(120).optional(),
  quantityOrScope: z.string().trim().max(300).optional(),
  country: z.string().trim().max(100).optional(),
  type: z.string().trim().max(50).optional(),
  subject: z.string().trim().max(200).optional(),
  preferredDateTime: z.string().trim().max(100).optional(),
  message: z
    .string()
    .trim()
    .min(3, 'Project details or message must be at least 3 characters')
    .max(5000, 'Message must be 5000 characters or less'),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
