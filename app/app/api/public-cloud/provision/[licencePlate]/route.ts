import { DecisionStatus, ProjectStatus, RequestType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { sendRequestCompletionEmails } from '@/services/ches/public-cloud';
import { models, publicCloudRequestDetailInclude } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: [],
  validations: { pathParams: pathParamSchema },
});
export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const request = await prisma.publicCloudRequest.findFirst({
    where: {
      decisionStatus: { in: [DecisionStatus.APPROVED, DecisionStatus.AUTO_APPROVED] },
      licencePlate,
      active: true,
    },
    include: {
      decisionData: true,
    },
  });

  if (!request) {
    return NotFoundResponse('No request found for this licece plate.');
  }

  const updateRequest = models.publicCloudRequest.update({
    where: {
      id: request.id,
    },
    data: {
      decisionStatus: DecisionStatus.PROVISIONED,
      provisionedDate: new Date(),
      active: false,
    },
    include: publicCloudRequestDetailInclude,
  });

  const { id, ...decisionData } = request.decisionData;

  // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
  const filter = { licencePlate };
  const upsertProject =
    request.type === RequestType.DELETE
      ? prisma.publicCloudProject.update({
          where: filter,
          data: { status: ProjectStatus.INACTIVE },
        })
      : prisma.publicCloudProject.upsert({
          where: filter,
          update: decisionData,
          create: decisionData,
        });

  const [updatedRequest] = await Promise.all([updateRequest, upsertProject]);
  const updatedRequestDecorated = await models.publicCloudRequest.decorate(updatedRequest, session, true);
  await sendRequestCompletionEmails(updatedRequestDecorated);

  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
