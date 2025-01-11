import { DecisionStatus, EventType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { createEvent, models } from '@/services/db';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.privateCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});

export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.privateCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.cancel) {
    return UnauthorizedResponse();
  }

  const updatedRequest = await models.privateCloudRequest.update(
    {
      where: {
        id,
        decisionStatus: DecisionStatus.PENDING,
        active: true,
      },
      data: {
        decisionStatus: DecisionStatus.CANCELLED,
      },
      select: {
        decisionStatus: true,
        createdByEmail: true,
      },
    },
    session,
  );

  if (updatedRequest) {
    await createEvent(EventType.CANCEL_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: id });
  }

  return OkResponse(updatedRequest);
});
