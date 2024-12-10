import { PrismaClient } from '@prisma/client';
import { NODE_ENV, LOG_DATABASE } from '@/config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const log: ('info' | 'query' | 'warn' | 'error')[] = LOG_DATABASE ? ['query', 'info', 'warn', 'error'] : [];

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log }).$extends({
    query: {},
  });

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
