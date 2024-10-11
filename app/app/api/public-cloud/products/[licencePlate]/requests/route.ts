import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, OkResponse } from '@/core/responses';
import { models } from '@/services/db';
import { processBoolean } from '@/utils/zod';

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

  const where: Prisma.PublicCloudRequestWhereInput = active ? { active: true } : {};
  where.licencePlate = licencePlate;

  const { data: requests } = await models.publicCloudRequest.list(
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
