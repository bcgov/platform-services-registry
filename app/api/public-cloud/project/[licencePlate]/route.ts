import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PublicCloudProject } from '@prisma/client';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import createApiHandler from '@/core/api-handler';

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

  const project = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      requests: {
        where: {
          active: true,
        },
      },
    },
  });

  if (!project) {
    return new NextResponse('No project found for this licence plate.', {
      status: 404,
    });
  }

  return NextResponse.json(project);
});

export type PublicCloudProjectGetPayload = Prisma.PublicCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    requests: {
      where: {
        active: true;
      };
    };
  };
}>;
