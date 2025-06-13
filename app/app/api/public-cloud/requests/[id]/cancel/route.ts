import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse, BadRequestResponse } from '@/core/responses';
import { DecisionStatus, EventType, RequestType, TaskStatus, TaskType } from '@/prisma/client';
import { sendRequestCancellationEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude } from '@/services/db';
import { commentSchema } from '@/validation-schemas';

const pathParamSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  decisionComment: commentSchema,
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User, GlobalRole.PublicAdmin],
  validations: {
    pathParams: pathParamSchema,
    body: bodySchema,
  },
});

export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const { decisionComment } = body;

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
      decisionComment,
    },
    include: publicCloudRequestDetailInclude,
  });

  const decoratedRequest = await models.publicCloudRequest.decorate(updated, session, true);

  const { type, licencePlate } = request;

  const proms: any[] = [
    prisma.task.deleteMany({
      where: {
        type: { in: [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST] },
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            requestId: updated.id,
            licencePlate: updated.licencePlate,
          },
        },
      },
    }),
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
