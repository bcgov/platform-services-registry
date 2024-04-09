import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import { wrapAsync } from '@/helpers/runtime';
import { PermissionsEnum } from '@/types/permissions';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const POST = apiHandler(async ({ pathParams, session }) => {
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

  const createRequest: PublicCloudRequestWithRequestedProject = await prisma.publicCloudRequest.create({
    data: {
      type: $Enums.PublicCloudRequestType.DELETE,
      decisionStatus: $Enums.DecisionStatus.PENDING,
      active: true,
      createdByEmail: userEmail as string,
      licencePlate: project.licencePlate,
      requestedProject: {
        create: rest,
      },
      userRequestedProject: {
        create: rest,
      },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: {
      requestedProject: {
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

  wrapAsync(() => {
    sendDeleteRequestEmails(createRequest.requestedProject);
    sendAdminDeleteRequestEmails(createRequest.requestedProject);
  });

  return OkResponse(true);
});
