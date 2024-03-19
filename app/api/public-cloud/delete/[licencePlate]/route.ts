import { NextResponse } from 'next/server';
import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import { wrapAsync } from '@/helpers/runtime';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const POST = apiHandler(async ({ pathParams, session }) => {
  console.log('sessionsession', session);
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
    return NextResponse.json(
      { message: 'Bad Request', error: 'there is no matching project not found' },
      { status: 400 },
    );
  }

  if (project.requests.length > 0) {
    return NextResponse.json(
      { message: 'Bad Request', error: 'there is an active request for this project' },
      { status: 400 },
    );
  }

  const projectWithPermissions = project as typeof project & PublicCloudProjectDecorate;

  if (!projectWithPermissions._permissions.delete) {
    return NextResponse.json({ message: 'Unauthorized', error: 'not allowed to perform the task' }, { status: 401 });
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

  return NextResponse.json({ success: true });
});
