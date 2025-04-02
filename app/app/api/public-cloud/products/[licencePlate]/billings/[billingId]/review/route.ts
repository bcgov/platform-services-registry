import { Prisma, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { sendAdminCreateRequestEmails } from '@/services/ches/public-cloud';
import { models, publicCloudBillingDetailInclude, publicCloudRequestDetailInclude, tasks } from '@/services/db';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  billingId: objectId,
});

const bodySchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { licencePlate, billingId } = pathParams;
  const { decision } = body;

  const assignedTask = await prisma.task.findFirst({
    where: {
      type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
      status: TaskStatus.ASSIGNED,
      data: { equals: { licencePlate } },
    },
  });

  if (!assignedTask) {
    return UnauthorizedResponse();
  }

  await tasks.close(TaskType.REVIEW_PUBLIC_CLOUD_MOU, { licencePlate, session, decision });

  if (decision === 'APPROVE') {
    const billing = await prisma.publicCloudBilling.update({
      where: {
        id: billingId,
      },
      data: {
        approved: true,
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
      include: publicCloudBillingDetailInclude,
    });

    const createRequest = await prisma.publicCloudRequest.findFirst({
      where: { licencePlate, type: RequestType.CREATE, active: true },
      include: publicCloudRequestDetailInclude,
    });

    if (createRequest) {
      const [billingDecorated, requestDecorated] = await Promise.all([
        models.publicCloudBilling.decorate(billing, session, true),
        models.publicCloudRequest.decorate(createRequest, session, true),
      ]);
      const requesterName = formatFullName(createRequest.createdBy);

      await Promise.all([
        tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_REQUEST, {
          request: requestDecorated,
          requester: requesterName,
        }),
        sendAdminCreateRequestEmails(requestDecorated, requesterName, billingDecorated),
      ]);
    } else {
      const msgId = `emou-complete-${new Date().getTime()}`;
      const lastRequest = await prisma.publicCloudRequest.findFirst({
        where: { licencePlate, active: false },
        orderBy: { createdAt: Prisma.SortOrder.desc },
        include: publicCloudRequestDetailInclude,
      });

      if (lastRequest) {
        const decoratedRequest = await models.publicCloudRequest.decorate(lastRequest, session, true);
        await sendPublicCloudNatsMessage({ ...decoratedRequest, id: msgId });
      } else {
        logger.error(`[MOU Review] No request found for licence plate ${licencePlate}`);
      }
    }
  }

  return OkResponse(true);
});
