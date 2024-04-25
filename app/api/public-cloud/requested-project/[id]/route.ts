import { NotFoundResponse, OkResponse } from '@/core/responses';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const request = await prisma.publicCloudRequestedProject.findUnique({
    where: {
      id,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
    session: session as never,
  });

  if (!request) {
    return NotFoundResponse('No requested project found with this id.');
  }

  return OkResponse(request);
});
