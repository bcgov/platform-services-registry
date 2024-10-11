import { Cluster, EventType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { hasContactsChanged } from '@/helpers/product';
import { createEvent, models } from '@/services/db';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  id: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.privateCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.resend) {
    return UnauthorizedResponse();
  }

  const contactsChanged = hasContactsChanged(request.project, request.decisionData);
  const msgId = `resend-${new Date().getTime()}`;

  await sendPrivateCloudNatsMessage({ ...request, id: msgId }, contactsChanged);

  // For GOLD requests, we create an identical request for GOLDDR
  if (request.decisionData.cluster === Cluster.GOLD && request.decisionData.golddrEnabled) {
    await sendPrivateCloudNatsMessage(
      {
        id: msgId,
        type: request.type,
        decisionData: { ...request.decisionData, cluster: Cluster.GOLDDR },
      },
      contactsChanged,
    );
  }

  await createEvent(EventType.RESEND_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: request.id });

  return OkResponse(true);
});
