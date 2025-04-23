import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { Prisma } from '@/prisma/client';
import { models } from '@/services/db';
import { processBoolean } from '@/utils/js';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  active: z.preprocess(processBoolean, z.boolean()),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const { active } = queryParams;

  const where: Prisma.PrivateCloudRequestWhereInput = active ? { active: true } : {};
  where.licencePlate = licencePlate;

  const { data: requests } = await models.privateCloudRequest.list(
    {
      where,
      orderBy: {
        createdAt: 'desc',
      },
    },
    session,
  );

  return OkResponse(requests);
});
