import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isProduction = process.env.NODE_ENV === 'production';
const isSQLite = (process.env.DATABASE_URL || '').startsWith('file:');

// Prisma client configuration
// - SQLite (dev): requires adapter: null workaround for Prisma 7.x
// - PostgreSQL (prod): standard configuration, no adapter needed
const prismaConfig: any = {
  log: isProduction
    ? ['error']                    // Only errors in production
    : ['query', 'error', 'warn'],  // Full logging in development
};

// SQLite-specific adapter workaround (Prisma 7.x requires adapter or accelerateUrl)
if (isSQLite) {
  prismaConfig.adapter = null;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig);

if (!isProduction) globalForPrisma.prisma = prisma;
