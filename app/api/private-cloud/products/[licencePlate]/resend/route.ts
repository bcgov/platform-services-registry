import { $Enums, Cluster } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import { getPrivateCloudRequest } from '@/queries/private-cloud-requests';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  licencePlate: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: ['admin'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.resend) {
    return UnauthorizedResponse();
  }

  const _request = product.requests.find((req) => req.decisionStatus === $Enums.DecisionStatus.APPROVED);
  const request = await getPrivateCloudRequest(session, _request?.id);

  if (!request) {
    return BadRequestResponse('target request not found');
  }

  const contactsChanged =
    product.projectOwner.email.toLowerCase() !== request.decisionData.projectOwner.email.toLowerCase() ||
    product.primaryTechnicalLead.email.toLowerCase() !==
      request.decisionData.primaryTechnicalLead.email.toLowerCase() ||
    product.secondaryTechnicalLead?.email.toLowerCase() !==
      request.decisionData?.secondaryTechnicalLead?.email.toLowerCase();

  const msgId = `resend-${new Date().getTime()}`;

  await sendPrivateCloudNatsMessage(msgId, request.type, request.decisionData, contactsChanged);

  // For GOLD requests, we create an identical request for GOLDDR
  if (request.decisionData.cluster === Cluster.GOLD && request.decisionData.golddrEnabled) {
    await sendPrivateCloudNatsMessage(
      msgId,
      request.type,
      { ...request.decisionData, cluster: Cluster.GOLDDR },
      contactsChanged,
    );
  }

  return OkResponse(true);
});
