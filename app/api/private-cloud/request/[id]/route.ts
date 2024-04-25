import prisma from '@/core/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { NotFoundResponse, OkResponse } from '@/core/responses';
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

  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
    session: session as never,
  });

  if (!request) {
    return NotFoundResponse('No project found with this id.');
  }

  return OkResponse(request);
});

export type PrivateCloudRequestWithCurrentAndRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;
