import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from '@/config';
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
            'count',
          ].includes(operation)
        ) {
          return query(args);
        }

        const { session, ...validArgs } = args;
        if (session === undefined) return query(validArgs);

        const svc = getService(model, session);
        if (!svc) return query(validArgs);

        const multi = ['findMany'].includes(operation);
        const writeOp = ['update', 'upsert', 'updateMany'].includes(operation);

        const { where, ...otherArgs } = validArgs;
        const filter = await svc.genFilter(where, writeOp ? 'write' : 'read');

        if (filter === false) {
          if (operation === 'count') return 0;
          return multi ? [] : null;
        }

        const result = await query({ ...otherArgs, where: filter });

        if (operation === 'count') {
          return result;
        }

        if (operation === 'updateMany') {
          return result;
        }

        const decorate = (doc: any) => (doc ? svc.decorate(doc) : null);
        const decorated = multi ? await Promise.all(result.map(decorate)) : await decorate(result);
        return decorated;
      },
    },
  });

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
