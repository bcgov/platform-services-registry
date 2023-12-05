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
          !['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany'].includes(operation)
        ) {
          return query(args);
        }

        const { session, ...validArgs } = args;
        if (session === undefined) return query(validArgs);

        const multi = ['findMany'].includes(operation);
        if (!session?.userId) return multi ? [] : null;

        const svc = getService(model, prisma, session);
        if (!svc) return query(args);

        const { where, ...otherArgs } = validArgs;
        const filter = await svc.genFilter(where);
        const result = await query({ ...otherArgs, where: filter });

        const decorated = multi ? await Promise.all(result.map(svc.decorate)) : await svc.decorate(result);
        return decorated;
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
