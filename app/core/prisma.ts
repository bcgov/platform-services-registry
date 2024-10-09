import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from '@/config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    query: {},
  });

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
