import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { TaskStatus } from '@/prisma/client';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  id: objectId,
});

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ReviewAllPrivateCloudRequests, GlobalPermissions.ReviewAllPublicCloudRequests],
  validations: { pathParams: pathParamSchema },
});

export const POST = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;
  const result = await prisma.task.update({
    where: { id },
    data: {
      startedAt: new Date(),
      status: TaskStatus.STARTED,
      startedBy: session.user.id,
    },
  });

  if (!result) {
    return BadRequestResponse('invalid task');
  }

  return OkResponse(result);
});
