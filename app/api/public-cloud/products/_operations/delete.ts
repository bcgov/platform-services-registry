import { $Enums } from '@prisma/client';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { deletePathParamSchema } from '../[licencePlate]/schema';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { userEmail } = session;
  const { licencePlate } = pathParams;

  const project = await prisma.publicCloudProject.findFirst({
    where: { licencePlate, status: $Enums.ProjectStatus.ACTIVE },
    include: {
      requests: {
        where: {
          active: true,
        },
      },
    },
    session: session as never,
  });

  if (!project) {
    return BadRequestResponse('there is no matching project not found');
  }

  if (project.requests.length > 0) {
    return BadRequestResponse('there is an active request for this project');
  }

  const projectWithPermissions = project as typeof project & PublicCloudProjectDecorate;

  if (!projectWithPermissions._permissions.delete) {
    return UnauthorizedResponse('not allowed to perform the task');
  }

  projectWithPermissions.status = $Enums.ProjectStatus.INACTIVE;

  const { id, requests, updatedAt, _permissions, ...rest } = projectWithPermissions;

  const createRequest = await prisma.publicCloudRequest.create({
    data: {
      type: $Enums.PublicCloudRequestType.DELETE,
      decisionStatus: $Enums.DecisionStatus.PENDING,
      active: true,
      createdByEmail: userEmail as string,
      licencePlate: project.licencePlate,
      decisionData: {
        create: rest,
      },
      requestData: {
        create: rest,
      },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: {
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  await Promise.all([
    sendDeleteRequestEmails(createRequest.decisionData, session.user.name),
    sendAdminDeleteRequestEmails(createRequest.decisionData),
  ]);

  return OkResponse(true);
}
