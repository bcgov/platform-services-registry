import { NextResponse } from 'next/server';
import { Prisma, $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { PrivateCloudRequestDecorate } from '@/types/doc-decorate';

interface PathParam {
  licencePlate: string;
}

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler<PathParam>({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.privateCloudRequest.findFirst({
    where: {
      licencePlate,
      active: true,
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

  return NextResponse.json(request);
});

export type PrivateCloudActiveRequestGetPayload = Prisma.PrivateCloudRequestGetPayload<{
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
  PrivateCloudRequestDecorate;
