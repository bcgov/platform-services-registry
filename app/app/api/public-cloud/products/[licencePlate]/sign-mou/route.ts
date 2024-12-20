import { RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { models, publicCloudRequestDetailInclude, tasks } from '@/services/db';

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

  const [billingUpdated] = await Promise.all([
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
    tasks.close(TaskType.SIGN_PUBLIC_CLOUD_MOU, { licencePlate, session }),
  ]);

  const request = await prisma.publicCloudRequest.findFirst({
    where: { type: RequestType.CREATE, licencePlate, active: true },
    include: publicCloudRequestDetailInclude,
  });

  if (request) {
    const requestDecorated = await models.publicCloudRequest.decorate(request, session, true);
    await tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_MOU, { billing: billingUpdated, request: requestDecorated });
  }

  return OkResponse(true);
});
