import { Provider, Cluster } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NoContent, OkResponse } from '@/core/responses';
import { processNumber, processUpperEnumString, processBoolean } from '@/utils/zod';
import { getBillingIdWhere } from '../helpers';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const queryParamSchema = z.object({
  context: z.preprocess(processUpperEnumString, z.union([z.nativeEnum(Provider), z.nativeEnum(Cluster)]).optional()),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { idOrAccountCoding } = pathParams;
  const { context } = queryParams;

  const billingWhereId = getBillingIdWhere(idOrAccountCoding, context);

  const count = await prisma.billing.count({
    where: billingWhereId,
  });

  return OkResponse(count > 0);
});
