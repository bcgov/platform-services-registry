import { Prisma } from '@prisma/client';

export type Product = Omit<
  Prisma.PublicCloudProjectGetPayload<{
    include: {
      billing: {
        include: {
          signedBy: true;
          approvedBy: true;
          expenseAuthority: true;
        };
      };
    };
  }>,
  'updatedAt'
>;
