import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { PublicCloudRequestDecorate } from '@/types/doc-decorate';
import { OkResponse } from '@/core/responses';
import { processBoolean } from '@/utils/zod';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const request = await prisma.publicCloudRequest.findFirst({
    where: { id },
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
    session: session as never,
  });

  return OkResponse(request);
});

export type PublicCloudRequestGetPayload = Prisma.PublicCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}> &
  PublicCloudRequestDecorate;
