import { TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendPublicCloudBillingReviewEmails } from '@/services/ches/public-cloud';
import { publicCloudRequestDetailInclude } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
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
  const { licencePlate } = pathParams;
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
          licencePlate,
        },
      },
    },
    data: {
      status: TaskStatus.COMPLETED,
    },
  });

  const request = await prisma.publicCloudRequest.findFirst({
    where: { licencePlate },
    include: publicCloudRequestDetailInclude,
  });

  if (!request) {
    return BadRequestResponse('invalid request');
  }

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

  await prisma.task.create({
    data: {
      type: TaskType.REVIEW_MOU,
      status: TaskStatus.ASSIGNED,
      roles: ['billing-reviewer'],
      data: {
        licencePlate: request.licencePlate,
      },
    },
  });

  await sendPublicCloudBillingReviewEmails(request);

  return OkResponse(true);
});
