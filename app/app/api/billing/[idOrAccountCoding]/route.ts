import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { BillingGetPayload } from '@/types/billing';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

export const GET = createApiHandler({
  roles: ['billing-reviewer'],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { idOrAccountCoding } = pathParams;

  const billing: BillingGetPayload | null = await prisma.billing.findFirst({
    where: { OR: [{ id: idOrAccountCoding }, { accountCoding: idOrAccountCoding }] },
    include: {
      expenseAuthority: true,
      signedBy: true,
      approvedBy: true,
    },
  });

  return OkResponse(billing);
});
