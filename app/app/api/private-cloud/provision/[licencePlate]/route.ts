import { $Enums, DecisionStatus, RequestType, ProjectStatus } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { privateCloudProductDetailInclude } from '@/queries/private-cloud-products';
import {
  sendProvisionedEmails,
  sendDeleteRequestApprovalEmails,
  sendEditRequestCompletedEmails,
} from '@/services/ches/private-cloud/email-handler';

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
    return NotFoundResponse('No request found for this licence plate.');
  }

  const updateRequest = prisma.privateCloudRequest.update({
    where: {
      id: request.id,
    },
    data: {
      decisionStatus: DecisionStatus.PROVISIONED,
      provisionedDate: new Date(),
      active: false,
    },
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

  await Promise.all([updateRequest, upsertProject]);

  const product = await prisma.privateCloudProject.findUnique({
    where: filter,
    include: privateCloudProductDetailInclude,
  });

  if (!product) return UnprocessableEntityResponse('product not found');

  if (request.type == RequestType.CREATE) {
    await sendProvisionedEmails(product);
  } else if (request.type == RequestType.DELETE) {
    await sendDeleteRequestApprovalEmails(product);
  } else if (request.type == RequestType.EDIT) {
    await sendEditRequestCompletedEmails(product);
  }

  logger.info(`Successfully marked ${licencePlate} as provisioned.`);
  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
