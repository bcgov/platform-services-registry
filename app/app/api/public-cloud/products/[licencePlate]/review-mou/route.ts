import { TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { sendAdminCreateRequestEmails } from '@/services/ches/public-cloud';
import { models, publicCloudRequestDetailInclude, tasks } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const bodySchema = z.object({
  taskId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT']),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { licencePlate } = pathParams;
  const { decision } = body;

  await tasks.close(TaskType.REVIEW_PUBLIC_CLOUD_MOU, { licencePlate, session, decision });

  if (decision === 'APPROVE') {
    const request = await prisma.publicCloudRequest.findFirst({
      where: { licencePlate },
      include: publicCloudRequestDetailInclude,
    });

    if (request) {
      const billing = await prisma.billing.update({
        where: {
          id: request?.decisionData.billingId,
        },
        data: {
          approved: true,
          approvedAt: new Date(),
          approvedById: session.user.id,
        },
        include: {
          expenseAuthority: true,
          signedBy: true,
          approvedBy: true,
        },
      });

      const requester = await prisma.user.findUnique({
        where: { email: request.createdByEmail },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      const requestDecorated = await models.publicCloudRequest.decorate(request, session, true);

      // Keep the billing information up to date.
      requestDecorated.decisionData.billing = billing;
      const requesterName = formatFullName(requester);

      await Promise.all([
        tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_REQUEST, {
          request: requestDecorated,
          requester: requesterName,
        }),
        sendAdminCreateRequestEmails(requestDecorated, requesterName),
      ]);
    }
  }

  return OkResponse(true);
});
