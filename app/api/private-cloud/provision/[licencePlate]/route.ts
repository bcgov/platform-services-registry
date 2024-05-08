import { $Enums, DecisionStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';
import { sendProvisionedEmails, sendDeleteRequestApprovalEmails } from '@/services/ches/private-cloud/email-handler';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { logger } from '@/core/logging';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: [],
  validations: { pathParams: pathParamSchema },
});
export const PUT = apiHandler(async ({ pathParams }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.privateCloudRequest.findFirst({
    where: {
      decisionStatus: DecisionStatus.APPROVED,
      licencePlate,
      active: true,
    },
    include: {
      decisionData: true,
    },
  });

  if (!request) {
    return NotFoundResponse('No request found for this license plate.');
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

  const { id, ...decisionData } = request.decisionData;

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
          update: decisionData,
          create: decisionData,
        });

  await prisma.$transaction([updateRequest, upsertProject]);

  logger.info(`Successfully marked ${licencePlate} as provisioned.`);

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

  if (request.type == 'CREATE') {
    await sendProvisionedEmails(project as PrivateCloudRequestedProjectWithContacts);
  } else if (request.type == 'DELETE') {
    await sendDeleteRequestApprovalEmails(project as PrivateCloudRequestedProjectWithContacts);
  }

  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
