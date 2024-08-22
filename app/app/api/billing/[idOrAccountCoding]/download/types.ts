import { Prisma } from '@prisma/client';

export type Product = Omit<Prisma.PublicCloudProjectGetPayload<null>, 'updatedAt'>;

export type Billing = Prisma.BillingGetPayload<{
  include: {
    signedBy: true;
    approvedBy: true;
    expenseAuthority: true;
  };
}>;
