import { $Enums, DecisionStatus, ProjectStatus, RequestType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { publicCloudProductDetailInclude } from '@/queries/public-cloud-products';
import { sendProvisionedEmails, sendDeleteRequestApprovalEmails } from '@/services/ches/public-cloud/email-handler';

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
      decisionData: true,
    },
  });

  if (!request) {
    return NotFoundResponse('No request found for this licece plate.');
  }

  const updateRequest = prisma.publicCloudRequest.update({
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
      ? prisma.publicCloudProject.update({
          where: filter,
          data: { status: ProjectStatus.INACTIVE },
        })
      : prisma.publicCloudProject.upsert({
          where: filter,
          update: decisionData,
          create: decisionData,
        });

  await Promise.all([updateRequest, upsertProject]);

  const product = await prisma.publicCloudProject.findUnique({
    where: filter,
    include: publicCloudProductDetailInclude,
  });

  if (!product) return UnprocessableEntityResponse('product not found');

  if (request.type == 'CREATE') {
    await sendProvisionedEmails(product);
  } else if (request.type == 'DELETE') {
    await sendDeleteRequestApprovalEmails(product);
  }

  return OkResponse(`Successfully marked ${licencePlate} as provisioned.`);
});
