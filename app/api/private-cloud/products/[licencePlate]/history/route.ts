import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { NotFoundResponse, OkResponse } from '@/core/responses';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate,
    },
    orderBy: {
      created: 'desc',
    },
    session: session as never,
  });

  if (!requests) {
    return NotFoundResponse('No requests found for this licence plate.');
  }

  return OkResponse(requests);
});
