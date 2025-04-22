import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { DecisionStatus, Prisma, ProjectStatus, RequestType } from '@/prisma/types';
import { sendRequestCompletionEmails } from '@/services/ches/public-cloud';
import { models, publicCloudRequestDetailInclude } from '@/services/db';
import { upsertPublicCloudBillings } from '@/services/db/public-cloud-billing';

const pathParamSchema = z.object({
  idOrLicencePlate: z.string().max(7),
});

const apiHandler = createApiHandler({
  roles: ['service-account public-admin'],
  useServiceAccount: true,
  validations: { pathParams: pathParamSchema },
});
export const POST = apiHandler(async ({ pathParams, session }) => {
  const { idOrLicencePlate: licencePlate } = pathParams;

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

  const updateRequest = prisma.publicCloudRequest.update({
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
      ? prisma.publicCloudProduct.update({
          where: filter,
          data: { status: ProjectStatus.INACTIVE },
        })
      : prisma.publicCloudProduct.upsert({
          where: filter,
          update: decisionData,
          create: decisionData,
        });

  const [updatedRequest] = await Promise.all([updateRequest, upsertProject]);
  const updatedRequestDecorated = await models.publicCloudRequest.decorate(updatedRequest, session, true);

  if (updatedRequestDecorated.type === RequestType.EDIT) {
    if (
      updatedRequestDecorated.originalData?.expenseAuthorityId !==
      updatedRequestDecorated.decisionData.expenseAuthorityId
    ) {
      const lastBilling = await prisma.publicCloudBilling.findFirst({
        select: { accountCoding: true },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      });

      await upsertPublicCloudBillings({
        request: updatedRequestDecorated,
        expenseAuthorityId: updatedRequestDecorated.decisionData.expenseAuthorityId!,
        accountCoding: lastBilling?.accountCoding,
        session,
      });
    }
  }

  await sendRequestCompletionEmails(updatedRequestDecorated);

  const message = `Successfully marked ${licencePlate} as provisioned.`;
  logger.info(message);
  return OkResponse({ success: true, message });
});
