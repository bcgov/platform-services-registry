import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { NoContent, OkResponse } from '@/core/responses';
import { processBoolean } from '@/utils/zod';
import { PrivateCloudRequestDecorate } from '@/types/doc-decorate';

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
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
    orderBy: {
      created: 'desc',
    },
    session: session as never,
  });

  return OkResponse(requests);
});

export type PrivateCloudProductRequestsGetPayload = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}> &
  PrivateCloudRequestDecorate;
