import { Prisma } from '@prisma/client';

export type BillingGetPayload = Prisma.BillingGetPayload<{
  include: {
    expenseAuthority: true;
    signedBy: true;
    approvedBy: true;
  };
}>;
