import { NotFoundResponse, OkResponse } from '@/core/responses';
import { $Enums, DecisionStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import { sendProvisionedEmails, sendDeleteRequestApprovalEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: [],
  validations: { pathParams: pathParamSchema },
});

export const PUT = apiHandler(async ({ pathParams }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.publicCloudRequest.findFirst({
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
    return NotFoundResponse('No requetst found for this licece plate.');
  }

  const updateRequest = prisma.publicCloudRequest.update({
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
      ? prisma.publicCloudProject.update({
          where: filter,
          data: { status: $Enums.ProjectStatus.INACTIVE },
        })
      : prisma.publicCloudProject.upsert({
          where: filter,
          update: requestedProject,
          create: requestedProject,
        });

  await prisma.$transaction([updateRequest, upsertProject]);

  // Note: For some reason this information cannot be retrieved from the transaction above without failing the test
  const project = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  });

  if (request.type == 'CREATE') {
    await wrapAsync(() => sendProvisionedEmails(project as PublicCloudRequestedProjectWithContacts));
  } else if (request.type == 'DELETE') {
    await wrapAsync(() => sendDeleteRequestApprovalEmails(project as PublicCloudRequestedProjectWithContacts));
  }

  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
