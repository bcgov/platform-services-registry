import { DecisionStatus, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { tasks, publicCloudProductDetailInclude } from '@/services/db';
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

  const [assignedTask, product] = await Promise.all([
    prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: { equals: { licencePlate } },
      },
    }),
    prisma.publicCloudProduct.findFirst({ where: { licencePlate }, include: publicCloudProductDetailInclude }),
  ]);

  let isExpenseAuthority = false;

  if (!assignedTask) {
    if (product?.expenseAuthorityId === session.user.id) {
      isExpenseAuthority = true;
    } else {
      // fallback to checking request EA if no product
      const request = await prisma.publicCloudRequest.findFirst({
        where: {
          licencePlate,
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
        },
        select: {
          decisionData: {
            select: {
              expenseAuthorityId: true,
            },
          },
        },
      });

      isExpenseAuthority = request?.decisionData?.expenseAuthorityId === session.user.id;
    }

    if (!isExpenseAuthority) {
      return UnauthorizedResponse();
    }
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
    await tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_MOU, {
      product: productDecorated,
      request: requestDecorated,
      billing: billingDecorated,
    });
  }

  return OkResponse(true);
});
