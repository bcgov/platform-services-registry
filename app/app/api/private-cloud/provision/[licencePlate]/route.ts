import { DecisionStatus, RequestType, ProjectStatus } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { sendRequestCompletionEmails } from '@/services/ches/private-cloud';
import { privateCloudRequestDetailInclude } from '@/services/db';

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
      decisionStatus: {
        in: [DecisionStatus.APPROVED, DecisionStatus.AUTO_APPROVED, DecisionStatus.PARTIALLY_PROVISIONED],
      },
      licencePlate,
      active: true,
    },
    include: {
      decisionData: true,
    },
  });

  if (!request) {
    return NotFoundResponse('No request found for this licence plate.');
  }

  // For products with Golddr enabled, two callbacks are required to complete the request.
  if (request.decisionData.golddrEnabled && request.decisionStatus !== DecisionStatus.PARTIALLY_PROVISIONED) {
    await prisma.privateCloudRequest.update({
      where: { id: request.id },
      data: {
        decisionStatus: DecisionStatus.PARTIALLY_PROVISIONED,
      },
    });
  } else {
    const updateRequest = prisma.privateCloudRequest.update({
      where: { id: request.id },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        provisionedDate: new Date(),
        active: false,
      },
      include: privateCloudRequestDetailInclude,
    });

    const { id, ...decisionData } = request.decisionData;

    // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
    const filter = { licencePlate };
    const upsertProject =
      request.type === RequestType.DELETE
        ? prisma.privateCloudProject.update({
            where: filter,
            data: { status: ProjectStatus.INACTIVE },
          })
        : prisma.privateCloudProject.upsert({
            where: filter,
            update: decisionData,
            create: decisionData,
          });

    const [updatedRequest] = await Promise.all([updateRequest, upsertProject]);

    await sendRequestCompletionEmails(updatedRequest);
  }

  logger.info(`Successfully marked ${licencePlate} as provisioned.`);
  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
