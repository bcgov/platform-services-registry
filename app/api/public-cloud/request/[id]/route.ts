import { NotFoundResponse, OkResponse } from '@/core/responses';
import prisma from '@/core/prisma';
import { Prisma } from '@prisma/client';
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

  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  if (!request) {
    return NotFoundResponse('No project found with this id.');
  }

  return OkResponse(request);
});

export type PublicCloudRequestWithCurrentAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;
