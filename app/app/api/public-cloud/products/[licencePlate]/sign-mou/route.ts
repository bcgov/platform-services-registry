import { RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendPublicCloudBillingReviewEmails } from '@/services/ches/public-cloud';
import { models, publicCloudRequestDetailInclude } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const bodySchema = z.object({
  taskId: z.string(),
  confirmed: z.boolean(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { licencePlate } = pathParams;
  const { taskId, confirmed } = body;

  if (!confirmed) return BadRequestResponse('not confirmed');

  const billing = await prisma.billing.findFirst({ where: { licencePlate, signed: false }, select: { id: true } });
  if (!billing) {
    return BadRequestResponse('invalid request');
  }

  await Promise.all([
    prisma.task.update({
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
    }),
    prisma.task.create({
      data: {
        type: TaskType.REVIEW_MOU,
        status: TaskStatus.ASSIGNED,
        roles: [GlobalRole.BillingReviewer],
        data: {
          licencePlate,
        },
      },
    }),
    prisma.billing.update({
      where: {
        id: billing.id,
      },
      data: {
        signed: true,
        signedAt: new Date(),
        signedById: session.user.id,
      },
    }),
  ]);

  const request = await prisma.publicCloudRequest.findFirst({
    where: { type: RequestType.CREATE, licencePlate, active: true },
    include: publicCloudRequestDetailInclude,
  });

  if (request) {
    const requestDecorated = await models.publicCloudRequest.decorate(request, session, true);
    await sendPublicCloudBillingReviewEmails(requestDecorated);
  }
  return OkResponse(true);
});
