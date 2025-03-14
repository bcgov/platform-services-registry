import { DecisionStatus, EventType, PublicCloudRequest, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestCancellationEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude } from '@/services/db';

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

  const updated = await prisma.publicCloudRequest.update({
    where: {
      id,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
    },
    data: {
      active: false,
      decisionStatus: DecisionStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledById: session.user.id,
    },
    include: publicCloudRequestDetailInclude,
  });

  const decoratedRequest = await models.publicCloudRequest.decorate(updated, session, true);

  const { type, licencePlate } = request;

  const proms: any[] = [
    sendRequestCancellationEmails(decoratedRequest, session.user.name),
    createEvent(EventType.CANCEL_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: id }),
  ];

  if (type === RequestType.CREATE) {
    proms.push(
      prisma.publicCloudBilling.deleteMany({
        where: { licencePlate },
      }),
      prisma.task.deleteMany({
        where: {
          type: { in: [TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] },
          status: TaskStatus.ASSIGNED,
          data: {
            equals: {
              licencePlate,
            },
          },
        },
      }),
    );
  }

  await Promise.all(proms);

  return OkResponse(true);
});
