import { Prisma } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NoContent, OkResponse } from '@/core/responses';
import { getBillingIdWhere } from '../helpers';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { idOrAccountCoding } = pathParams;
  const billingWhereId = getBillingIdWhere(idOrAccountCoding);

  const count = await prisma.billing.count({
    where: billingWhereId,
  });

  return OkResponse(count > 0);
});
