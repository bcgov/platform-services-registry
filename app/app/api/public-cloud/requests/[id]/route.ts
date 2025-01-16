import { DecisionStatus, EventType, PublicCloudRequest, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
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

  const { data: request } = await models.publicCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});

export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.publicCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.cancel) {
    return UnauthorizedResponse();
  }

  const { data: updatedRequest } = await models.publicCloudRequest.update(
    {
      where: {
        id,
        decisionStatus: DecisionStatus.PENDING,
        active: true,
      },
      data: {
        decisionStatus: DecisionStatus.CANCELLED,
        active: false,
      },
      select: {
        licencePlate: true,
      },
    },
    session,
  );

  const { licencePlate } = updatedRequest as unknown as PublicCloudRequest;

  if (request?.type === RequestType.CREATE) {
    await prisma.billing.deleteMany({
      where: {
        licencePlate,
      },
    });

    await prisma.task.deleteMany({
      where: {
        data: {
          equals: {
            licencePlate,
          },
        },
        type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
      },
    });
  }

  await createEvent(EventType.CANCEL_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: id });

  return OkResponse(true);
});
