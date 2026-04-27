import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

const prismaConfig = {
  log: isProduction
    ? [...(['error'] as const)]                    // Only errors in production
    : [...(['query', 'error', 'warn'] as const)],  // Full logging in development
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig);

if (!isProduction) globalForPrisma.prisma = prisma;
