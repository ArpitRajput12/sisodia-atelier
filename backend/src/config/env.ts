import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file (supports root cwd, backend cwd, and compiled dist)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for PostgreSQL/Neon'),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
  DEFAULT_CURRENCY: z.enum(['USD', 'GBP', 'EUR', 'AED', 'INR']).default('USD'),
  SUPPORTED_CURRENCIES: z.string().default('INR,USD,GBP,EUR,AED'),
  ATELIER_CONCIERGE_EMAIL: z.string().email().default('concierge@sisodiaatelier.com'),

  // Payment Gateways
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_API_URL: z.string().default('https://api-m.sandbox.paypal.com'),

  // Multi-Provider AI LLM Configuration (.env Switch)
  AI_PROVIDER: z.enum(['gemini', 'claude', 'openai', 'groq', 'openrouter']).default('gemini'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  SENDER_EMAIL: z.string().default('concierge@sisodiaatelier.com'),

  // Owner Desk Passcode (Yash Sisodia Founder Desk)
  OWNER_PASSCODE: z.string().optional().default(''),

  // Cloudinary Media Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid backend environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

