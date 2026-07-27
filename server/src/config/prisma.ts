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
    logger.info('✅ Connected to PostgreSQL via Prisma ORM');
  } catch (err: any) {
    logger.error('----------------------------------------------------------------------');
    logger.error(`❌ Database Connection Error: ${err.message}`);
    logger.error('👉 Cause: Unable to reach the PostgreSQL host configured in server/.env');
    logger.error('👉 Resolution Options:');
    logger.error('   1. Check your internet connection (if using Neon Cloud PostgreSQL).');
    logger.error('   2. Update `DATABASE_URL` in `server/.env` to a live PostgreSQL connection string.');
    logger.error('      (e.g., from Neon.tech, Supabase, or a local PostgreSQL instance: postgresql://postgres:password@localhost:5432/connecthub)');
    logger.error('----------------------------------------------------------------------');
    process.exit(1);
  }
};
