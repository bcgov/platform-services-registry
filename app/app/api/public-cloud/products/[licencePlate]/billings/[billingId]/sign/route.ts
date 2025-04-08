import { DecisionStatus, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { tasks, publicCloudRequestDetailInclude } from '@/services/db';
import { getPublicCloudBillingResources } from '@/services/db/public-cloud-billing';
import { objectId, accountCodingSchema } from '@/validation-schemas';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  billingId: objectId,
});

const bodySchema = z.object({
  accountCoding: accountCodingSchema,
  confirmed: z.boolean(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { licencePlate, billingId } = pathParams;
  const { accountCoding, confirmed } = body;

  if (!confirmed) return BadRequestResponse('not confirmed');

  const [assignedTask, request] = await Promise.all([
    prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: { equals: { licencePlate } },
      },
    }),
    prisma.publicCloudRequest.findFirst({
      where: { type: RequestType.CREATE, decisionStatus: DecisionStatus.PENDING, licencePlate },
      include: publicCloudRequestDetailInclude,
    }),
  ]);

  const isExpenseAuthority = request?.requestData?.expenseAuthorityId === session.user.id;

  if (!(!!assignedTask || isExpenseAuthority)) {
    return UnauthorizedResponse();
  }

  await Promise.all([
    prisma.publicCloudBilling.update({
      where: {
        id: billingId,
      },
      data: {
        accountCoding,
        signed: true,
        signedAt: new Date(),
        signedById: session.user.id,
      },
    }),
    tasks.close(TaskType.SIGN_PUBLIC_CLOUD_MOU, { licencePlate, session }),
  ]);

  const { productDecorated, requestDecorated, billingDecorated } = await getPublicCloudBillingResources({
    billingId,
    licencePlate,
    complete: false,
    session,
  });

  if (billingDecorated) {
    const existingReviewTask = await prisma.task.findFirst({
      where: {
        type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: { licencePlate },
        },
      },
    });

    if (existingReviewTask) {
      console.log('existingReviewTask2', existingReviewTask);
      await prisma.task.update({
        where: { id: existingReviewTask.id },
        data: { status: TaskStatus.CANCELED },
      });
    }

    await tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_MOU, {
      product: productDecorated,
      request: requestDecorated,
      billing: billingDecorated,
    });
  }

  return OkResponse(true);
});
