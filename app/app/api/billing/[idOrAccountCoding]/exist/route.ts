import { Prisma } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NoContent, OkResponse } from '@/core/responses';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { idOrAccountCoding } = pathParams;

  const count = await prisma.billing.count({
    where: { OR: [{ id: idOrAccountCoding }, { accountCoding: idOrAccountCoding }] },
  });

  return OkResponse(count > 0);
});
