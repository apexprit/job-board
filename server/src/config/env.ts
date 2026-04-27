import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('localhost'),

  // Database
  // In production, DATABASE_URL should point to PostgreSQL (e.g. Supabase)
  // In development, it can point to a local SQLite file
  DATABASE_URL: z.string().min(1),

  // Direct database URL for Prisma migrations (Supabase requires non-pooled connection)
  // If not set, DATABASE_URL is used (fine for local dev)
  DIRECT_URL: z.string().optional(),

  // JWT — must be set explicitly in production
  JWT_SECRET: z.string().min(1).refine(
    (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
    { message: 'JWT_SECRET must be at least 32 characters in production' }
  ),
  JWT_REFRESH_SECRET: z.string().min(1).refine(
    (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
    { message: 'JWT_REFRESH_SECRET must be at least 32 characters in production' }
  ),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Redis (optional — in-memory fallback exists)
  REDIS_URL: z.string().url().optional(),

  // CORS — comma-separated list of allowed origins
  // e.g. "https://job-board.vercel.app,http://localhost:5173"
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Render detection — Render sets this automatically
  RENDER: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = getEnv();

/** Check if running on Render */
export const isRender = !!process.env.RENDER;

/** Check if running in production */
export const isProduction = process.env.NODE_ENV === 'production';
