import { z, TypeOf, ZodType } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { getPathParamSchema } from '../[licencePlate]/route';

export default async function readOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof getPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      requests: {
        where: {
          active: true,
        },
      },
    },
    session: session as never,
  });

  if (!project) {
    return NotFoundResponse('No project found for this licence plate.');
  }

  return OkResponse(project);
}

export type PrivateCloudProjectGetPayload = Prisma.PrivateCloudProjectGetPayload<{
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
}> &
  PrivateCloudProjectDecorate;
