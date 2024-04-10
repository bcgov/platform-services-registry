import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import { sendDeleteRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { isEligibleForDeletion } from '@/helpers/openshift';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import { wrapAsync } from '@/helpers/runtime';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';

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

  const project = await prisma.privateCloudProject.findFirst({
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

  const projectWithPermissions = project as typeof project & PrivateCloudProjectDecorate;

  if (!projectWithPermissions._permissions.delete) {
    return UnauthorizedResponse('not allowed to perform the task');
  }

  const canDelete = await isEligibleForDeletion(projectWithPermissions.licencePlate, projectWithPermissions.cluster);
  if (!canDelete) {
    return BadRequestResponse(
      'this project is not deletable as it is not empty. Please delete all resources before deleting the project.',
    );
  }

  project.status = $Enums.ProjectStatus.INACTIVE;

  const { id, requests, updatedAt, _permissions, ...rest } = projectWithPermissions;

  const createRequest: PrivateCloudRequestWithRequestedProject = await prisma.privateCloudRequest.create({
    data: {
      type: $Enums.RequestType.DELETE,
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
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

  wrapAsync(() => sendDeleteRequestEmails(createRequest.requestedProject));

  return OkResponse(true);
});
