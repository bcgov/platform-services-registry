import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { TaskStatus, TaskType } from '@/prisma/client';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  id: objectId,
});

const apiHandler = createApiHandler({
  validations: { pathParams: pathParamSchema },
});

export const POST = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const isAssigned = session.tasks.some((task) => task.id === id);
  if (!isAssigned) {
    return BadRequestResponse('task is not assigned to you');
  }

  const result = await prisma.task.update({
    where: {
      id,
      status: TaskStatus.ASSIGNED,
    },
    data: {
      startedAt: new Date(),
      status: TaskStatus.STARTED,
      startedBy: session.user.id,
    },
  });

  if (result.type === TaskType.REVIEW_PRIVATE_CLOUD_REQUEST || result.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST) {
    if (result.data && result.data['requestId']) {
      const updateData = { where: { id: result.data['requestId'] }, data: { actioned: true } };

      if (result.type === TaskType.REVIEW_PRIVATE_CLOUD_REQUEST) {
        await prisma.privateCloudRequest.update(updateData);
      } else if (result.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST) {
        await prisma.publicCloudRequest.update(updateData);
      }
    }
  }

  if (!result) {
    return BadRequestResponse('invalid task');
  }

  return OkResponse(result);
});
