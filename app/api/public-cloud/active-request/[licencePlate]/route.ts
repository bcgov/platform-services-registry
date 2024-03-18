import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import { Prisma } from '@prisma/client';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.publicCloudRequest.findFirst({
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

  // if (!request) {
  //   return new NextResponse("No project found for this licence plate.", {
  //     status: 404,
  //   });
  // }

  return NextResponse.json(request);
});

export type PublicCloudActiveRequestGetPayload = Prisma.PublicCloudRequestGetPayload<{
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
}>;
