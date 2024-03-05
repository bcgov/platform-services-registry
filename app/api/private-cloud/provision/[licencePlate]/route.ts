import { NextResponse } from 'next/server';
import { $Enums, DecisionStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';
import { sendProvisionedEmails } from '@/services/ches/private-cloud/email-handler';

interface PathParam {
  licencePlate: string;
}

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler<PathParam>({
  roles: [],
  validations: { pathParams: pathParamSchema },
});
export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.privateCloudRequest.findFirst({
    where: {
      decisionStatus: DecisionStatus.APPROVED,
      licencePlate,
      active: true,
    },
    include: {
      requestedProject: true,
    },
  });

  if (!request) {
    console.log('No provision request found for project: ' + licencePlate);
    return new NextResponse('No requetst found for this licece plate.', {
      status: 404,
    });
  }

  const updateRequest = prisma.privateCloudRequest.update({
    where: {
      id: request.id,
    },
    data: {
      decisionStatus: DecisionStatus.PROVISIONED,
      active: false,
    },
  });

  const { id, ...requestedProject } = request.requestedProject;

  // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
  const filter = { licencePlate };
  const upsertProject =
    request.type === $Enums.RequestType.DELETE
      ? prisma.privateCloudProject.update({
          where: filter,
          data: { status: $Enums.ProjectStatus.INACTIVE },
        })
      : prisma.privateCloudProject.upsert({
          where: filter,
          update: requestedProject,
          create: requestedProject,
        });

  await prisma.$transaction([updateRequest, upsertProject]);

  console.log(`Successfully marked ${licencePlate} as provisioned.`);

  // Note: For some reason this information cannot be retrieved from the transaction above without failing the test
  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  sendProvisionedEmails(project as PrivateCloudRequestedProjectWithContacts);
  return new NextResponse(`Successfully marked ${licencePlate} as provisioned.`, { status: 200 });
});
