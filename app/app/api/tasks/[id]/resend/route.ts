import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { TaskType } from '@/prisma/client';
import { models, tasks, privateCloudRequestDetailInclude, publicCloudRequestDetailInclude } from '@/services/db';
import { getPublicCloudBillingResources } from '@/services/db/public-cloud-billing';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  id: objectId,
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
      requester: request.createdBy?.email ?? '',
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
    await tasks.sendEmail(task.type, { request: requestDecorated, requester: request.createdBy.email });

    return OkResponse(true);
  } else if (task.type === TaskType.SIGN_PUBLIC_CLOUD_MOU) {
    const data = task.data as { licencePlate: string };
    const { billingDecorated, productDecorated, requestDecorated } = await getPublicCloudBillingResources({
      licencePlate: data.licencePlate,
      complete: false,
      session,
    });

    if (!billingDecorated) {
      return BadRequestResponse('invalid task');
    }

    await tasks.sendEmail(task.type, {
      product: productDecorated,
      request: requestDecorated,
      billing: billingDecorated,
    });

    return OkResponse(true);
  } else if (task.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU) {
    const data = task.data as { licencePlate: string };
    const { billingDecorated, productDecorated, requestDecorated } = await getPublicCloudBillingResources({
      licencePlate: data.licencePlate,
      complete: false,
      session,
    });

    if (!billingDecorated) {
      return BadRequestResponse('invalid task');
    }

    await tasks.sendEmail(task.type, {
      product: productDecorated,
      request: requestDecorated,
      billing: billingDecorated,
    });

    return OkResponse(true);
  }

  return BadRequestResponse('invalid task');
});
