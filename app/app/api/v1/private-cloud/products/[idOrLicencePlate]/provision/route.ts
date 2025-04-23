import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { sendWebhookMessage } from '@/helpers/webhook';
import { DecisionStatus, RequestType, ProjectStatus } from '@/prisma/client';
import { sendRequestCompletionEmails } from '@/services/ches/private-cloud';
import { models, privateCloudRequestDetailInclude } from '@/services/db';

const pathParamSchema = z.object({
  idOrLicencePlate: z.string().max(7),
});

const apiHandler = createApiHandler({
  roles: ['service-account private-admin'],
  useServiceAccount: true,
  validations: { pathParams: pathParamSchema },
});
export const POST = apiHandler(async ({ pathParams, session }) => {
  const { idOrLicencePlate: licencePlate } = pathParams;

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

  let isPartialProvision = false;

  // For products with Golddr enabled, two callbacks are required to complete the request.
  if (request.decisionData.golddrEnabled && request.decisionStatus !== DecisionStatus.PARTIALLY_PROVISIONED) {
    await prisma.privateCloudRequest.update({
      where: { id: request.id },
      data: {
        decisionStatus: DecisionStatus.PARTIALLY_PROVISIONED,
      },
    });
    isPartialProvision = true;
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
        ? prisma.privateCloudProduct.update({
            where: filter,
            data: { status: ProjectStatus.INACTIVE },
          })
        : prisma.privateCloudProduct.upsert({
            where: filter,
            update: decisionData,
            create: decisionData,
          });

    const [updatedRequest, upsertedProduct] = await Promise.all([updateRequest, upsertProject]);
    const updatedRequestDecorated = await models.privateCloudRequest.decorate(updatedRequest, session, true);

    await Promise.all([
      sendRequestCompletionEmails(updatedRequestDecorated),
      sendWebhookMessage(upsertedProduct.licencePlate, {
        action: request.type,
        product: {
          id: upsertedProduct.id,
          licencePlate: upsertedProduct.licencePlate,
        },
      }),
    ]);
  }

  const message = `Successfully marked ${licencePlate} as ${isPartialProvision ? 'partially-' : ''}provisioned.`;
  logger.info(message);
  return OkResponse({ success: true, message });
});
