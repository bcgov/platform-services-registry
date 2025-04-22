import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { EventType } from '@/prisma/types';
import { createEvent, models } from '@/services/db';
import { sendPublicCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  id: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.publicCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.resend) {
    return UnauthorizedResponse();
  }

  const msgId = `resend-${new Date().getTime()}`;

  const proms = [
    sendPublicCloudNatsMessage({ ...request, id: msgId }),
    createEvent(EventType.RESEND_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: request.id }),
  ];

  await Promise.all(proms);

  return OkResponse(true);
});
