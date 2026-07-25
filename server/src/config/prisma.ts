import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Singleton PrismaClient - reuse across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to Neon PostgreSQL via Prisma ORM');
  } catch (err: any) {
    logger.error(`❌ Database connection failed: ${err.message}`);
    process.exit(1);
  }
};
