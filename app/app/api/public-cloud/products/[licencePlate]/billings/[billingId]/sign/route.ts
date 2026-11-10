import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { TaskStatus, TaskType } from '@/prisma/client';
import { tasks } from '@/services/db';
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
  const billing = await prisma.publicCloudBilling.findFirst({
    where: {
      id: billingId,
      licencePlate,
      approved: false,
    },
  });

  if (!billing) {
    return BadRequestResponse('invalid billing');
  }

  if (billing.agreementVersion !== 2) {
    return BadRequestResponse('unsupported agreement version');
  }

  if (billing.expenseAuthorityId !== session.user.id) {
    return UnauthorizedResponse();
  }

  const assignedTask = await prisma.task.findFirst({
    where: {
      type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
      status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
      userIds: { has: session.user.id },
      OR: [{ data: { equals: { licencePlate, billingId } } }, { data: { equals: { licencePlate } } }],
    },
  });

  const canResign = billing.signed && !billing.approved;

  if (!canResign && !assignedTask) {
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
    tasks.close(TaskType.SIGN_PUBLIC_CLOUD_MOU, {
      licencePlate,
      billingId,
      session,
    }),
  ]);

  const { productDecorated, requestDecorated, billingDecorated } = await getPublicCloudBillingResources({
    billingId,
    licencePlate,
    complete: false,
    session,
  });

  if (billingDecorated) {
    await prisma.task.updateMany({
      where: {
        type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
        status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
        data: {
          equals: { licencePlate },
        },
      },
      data: {
        status: TaskStatus.CANCELED,
      },
    });

    await tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_MOU, {
      product: productDecorated,
      request: requestDecorated,
      billing: billingDecorated,
    });
  }

  return OkResponse(true);
});
