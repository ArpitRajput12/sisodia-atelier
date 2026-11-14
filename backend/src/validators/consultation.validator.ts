import { z } from 'zod';
import { ALLOWED_CONSULTATION_SLOTS } from '../services/consultation.service';

export const bookConsultationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid patron email address'),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  commissionReason: z
    .string()
    .min(3, 'Please describe your wood commission reason (e.g. Dining table, Fluted urn, Haveli panel)'),
  meetingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  timeSlot: z.preprocess(
    (val) =>
      typeof val === 'string'
        ? val.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212-]/g, '–').replace(/\s*–\s*/g, ' – ').trim()
        : val,
    z.enum(ALLOWED_CONSULTATION_SLOTS as unknown as [string, ...string[]], {
      errorMap: () => ({
        message:
          'Time slot must be strictly within the 11:00 AM – 2:00 PM IST window: ["11:00 AM – 11:30 AM IST", "11:30 AM – 12:00 PM IST", "12:00 PM – 12:30 PM IST", "12:30 PM – 01:00 PM IST", "01:00 PM – 01:30 PM IST", "01:30 PM – 02:00 PM IST"]',
      }),
    })
  ),
  notes: z.string().optional(),
});

export const consultationQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
});
