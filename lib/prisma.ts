import { PrismaClient } from '@prisma/client';
import { getService } from '@/core/services';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        if (
          !model ||
          ![
            'findUnique',
            'findUniqueOrThrow',
            'findFirst',
            'findFirstOrThrow',
            'findMany',
            'update',
            'upsert',
            'updateMany',
          ].includes(operation)
        ) {
          return query(args);
        }

        const { session, ...validArgs } = args;
        if (session === undefined) return query(validArgs);

        const svc = getService(model, prisma, session);
        if (!svc) return query(validArgs);

        const multi = ['findMany'].includes(operation);
        const writeOp = ['update', 'upsert', 'updateMany'].includes(operation);

        const { where, ...otherArgs } = validArgs;
        const filter = await svc.genFilter(where, writeOp ? 'write' : 'read');
        const result = await query({ ...otherArgs, where: filter });

        if (operation === 'updateMany') {
          return result;
        }

        const decorated = multi ? await Promise.all(result.map(svc.decorate)) : await svc.decorate(result);
        return decorated;
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
