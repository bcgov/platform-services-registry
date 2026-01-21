import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { DecisionStatus, EventType, TaskStatus, TaskType } from '@/prisma/client';
import { sendRequestCancellationEmails } from '@/services/ches/private-cloud';
import { createEvent, models, privateCloudRequestDetailInclude } from '@/services/db';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.privateCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.cancel) {
    return UnauthorizedResponse();
  }

  const updated = await prisma.privateCloudRequest.update({
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
    include: privateCloudRequestDetailInclude,
  });

  const decoratedRequest = await models.privateCloudRequest.decorate(updated, session, true);

  await Promise.all([
    prisma.task.deleteMany({
      where: {
        type: { in: [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST] },
        status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
        data: {
          equals: {
            requestId: updated.id,
            licencePlate: updated.licencePlate,
          },
        },
      },
    }),
    sendRequestCancellationEmails(decoratedRequest, session.user.name),
    createEvent(EventType.CANCEL_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: id }),
  ]);

  return OkResponse(true);
});
