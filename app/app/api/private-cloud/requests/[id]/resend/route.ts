import { Cluster, EventType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { hasContactsChanged } from '@/helpers/product';
import { createEvent } from '@/mutations/events';
import { getPrivateCloudRequest } from '@/queries/private-cloud-requests';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  id: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const request = await getPrivateCloudRequest(session, id);

  if (!request?._permissions.resend) {
    return UnauthorizedResponse();
  }

  const contactsChanged = hasContactsChanged(request.project, request.decisionData);
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

  await createEvent(EventType.RESEND_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: request.id });

  return OkResponse(true);
});
