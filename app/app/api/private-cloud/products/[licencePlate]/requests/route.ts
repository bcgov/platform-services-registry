import { Prisma } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NoContent, OkResponse } from '@/core/responses';
import { privateCloudRequestSimpleInclude } from '@/queries/private-cloud-requests';
import { PrivateCloudRequestSimpleDecorated } from '@/types/private-cloud';
import { processBoolean } from '@/utils/zod';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  active: z.preprocess(processBoolean, z.boolean()),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const { active } = queryParams;

  const where: Prisma.PrivateCloudRequestWhereInput = active ? { active: true } : {};
  where.licencePlate = licencePlate;

  const requests = await prisma.privateCloudRequest.findMany({
    where,
    include: privateCloudRequestSimpleInclude,
    orderBy: {
      createdAt: 'desc',
    },
    session: session as never,
  });

  return OkResponse(requests as PrivateCloudRequestSimpleDecorated[]);
});
