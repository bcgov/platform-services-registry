import { LOG_DATABASE } from '@/config';
import { PrismaClient } from '@/prisma/client';

const log: ('info' | 'query' | 'warn' | 'error')[] = LOG_DATABASE ? ['query', 'info', 'warn', 'error'] : [];

const prisma = new PrismaClient({ log }).$extends({
  query: {},
});

export default prisma;
