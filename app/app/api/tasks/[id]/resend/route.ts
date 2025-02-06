import { TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import {
  models,
  tasks,
  getMostRecentPublicCloudRequest,
  privateCloudRequestDetailInclude,
  publicCloudRequestDetailInclude,
} from '@/services/db';

const pathParamSchema = z.object({
  id: z.string().min(1),
});

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.SendTaskEmails],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task?.data) {
    return BadRequestResponse('invalid task');
  }

  if (task.type === TaskType.REVIEW_PRIVATE_CLOUD_REQUEST) {
    const data = task.data as { requestId: string };
    const request = await prisma.privateCloudRequest.findUnique({
      where: { id: data.requestId },
      include: privateCloudRequestDetailInclude,
    });

    if (!request) {
      return BadRequestResponse('invalid task');
    }

    const requestDecorated = await models.privateCloudRequest.decorate(request, session, true);
    await tasks.sendEmail(task.type, {
      request: requestDecorated,
      requester: request.createdByEmail ?? '',
    });

    return OkResponse(true);
  } else if (task.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST) {
    const data = task.data as { requestId: string };
    const request = await prisma.publicCloudRequest.findUnique({
      where: { id: data.requestId },
      include: publicCloudRequestDetailInclude,
    });

    if (!request) {
      return BadRequestResponse('invalid task');
    }

    const requestDecorated = await models.publicCloudRequest.decorate(request, session, true);
    await tasks.sendEmail(task.type, { request: requestDecorated, requester: request.createdByEmail });

    return OkResponse(true);
  } else if (task.type === TaskType.SIGN_PUBLIC_CLOUD_MOU) {
    const data = task.data as { licencePlate: string };
    const recentRequest = await getMostRecentPublicCloudRequest(data.licencePlate);

    if (!recentRequest) {
      return BadRequestResponse('invalid task');
    }

    const requestDecorated = await models.publicCloudRequest.decorate(recentRequest, session, true);
    await tasks.sendEmail(task.type, { request: requestDecorated });

    return OkResponse(true);
  } else if (task.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU) {
    const data = task.data as { licencePlate: string };
    const recentRequest = await getMostRecentPublicCloudRequest(data.licencePlate);

    if (!recentRequest) {
      return BadRequestResponse('invalid task');
    }

    const requestDecorated = await models.publicCloudRequest.decorate(recentRequest, session, true);
    await tasks.sendEmail(task.type, { request: requestDecorated });

    return OkResponse(true);
  }

  return BadRequestResponse('invalid task');
});
