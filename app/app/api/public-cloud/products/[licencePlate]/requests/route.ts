import { Prisma } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NoContent, OkResponse } from '@/core/responses';
import { publicCloudRequestSimpleInclude } from '@/queries/public-cloud-requests';
import { PublicCloudRequestSimple, PublicCloudRequestSimpleDecorated } from '@/types/public-cloud';
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

  const where: Prisma.PublicCloudRequestWhereInput = active ? { active: true } : {};
  where.licencePlate = licencePlate;

  const requests: PublicCloudRequestSimple[] = await prisma.publicCloudRequest.findMany({
    where,
    include: publicCloudRequestSimpleInclude,
    orderBy: {
      createdAt: 'desc',
    },
    session: session as never,
  });

  return OkResponse(requests as PublicCloudRequestSimpleDecorated[]);
});
