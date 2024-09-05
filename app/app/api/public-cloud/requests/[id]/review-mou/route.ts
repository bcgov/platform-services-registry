import { DecisionStatus, User, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { publicCloudRequestDetailInclude } from '@/queries/public-cloud-requests';
import { sendRequestReviewEmails, sendEmouServiceAgreementEmail } from '@/services/ches/public-cloud/email-handler';

const pathParamSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  taskId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT']),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const { taskId, decision } = body;

  await prisma.task.update({
    where: {
      id: taskId,
      type: TaskType.REVIEW_MOU,
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
      closedMetadata: {
        decision,
      },
    },
  });

  if (decision === 'APPROVE') {
    const request = await prisma.publicCloudRequest.findUnique({
      where: { id },
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

      // Keep the billing information up to date.
      request.decisionData.billing = billing;

      await Promise.all([
        sendRequestReviewEmails(request, formatFullName(requester)),
        sendEmouServiceAgreementEmail(request),
      ]);
    }
  }

  return OkResponse(true);
});
