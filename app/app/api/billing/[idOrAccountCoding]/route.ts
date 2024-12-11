import { Provider, Cluster } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { BillingGetPayload } from '@/types/billing';
import { processNumber, processUpperEnumString, processBoolean } from '@/utils/js';
import { getBillingIdWhere } from './helpers';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const queryParamSchema = z.object({
  context: z.preprocess(processUpperEnumString, z.union([z.nativeEnum(Provider), z.nativeEnum(Cluster)]).optional()),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
})(async ({ pathParams, queryParams, session }) => {
  const { idOrAccountCoding } = pathParams;
  const { context } = queryParams;

  const billingWhereId = getBillingIdWhere(idOrAccountCoding, context);

  const billing: BillingGetPayload | null = await prisma.billing.findFirst({
    where: billingWhereId,
    include: {
      expenseAuthority: true,
      signedBy: true,
      approvedBy: true,
    },
  });

  return OkResponse(billing);
});
