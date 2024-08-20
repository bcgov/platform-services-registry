import { DecisionStatus, User, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';

const pathParamSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  taskId: z.string(),
  confirmed: z.boolean(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const { taskId, confirmed } = body;

  if (!confirmed) return BadRequestResponse('not confirmed');

  await prisma.task.update({
    where: {
      id: taskId,
      type: TaskType.SIGN_MOU,
      status: TaskStatus.ASSIGNED,
      OR: [{ userIds: { has: session.user.id } }, { roles: { hasSome: session.roles } }],
      data: {
        equals: {
          requestId: id,
        },
      },
    },
    data: {
      status: TaskStatus.COMPLETED,
    },
  });

  const request = await prisma.publicCloudRequest.findUnique({ where: { id }, include: { decisionData: true } });
  if (request) {
    await prisma.billing.update({
      where: {
        id: request?.decisionData.billingId,
      },
      data: {
        signed: true,
        signedAt: new Date(),
        signedById: session.user.id,
      },
    });
  }

  await prisma.task.create({
    data: {
      type: TaskType.REVIEW_MOU,
      status: TaskStatus.ASSIGNED,
      roles: ['billing-reviewer'],
      data: {
        requestId: id,
      },
    },
  });

  return OkResponse(true);
});
