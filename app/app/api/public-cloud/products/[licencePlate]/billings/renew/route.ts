import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { ProjectStatus, TaskType, TaskStatus } from '@/prisma/client';
import { models, publicCloudBillingDetailInclude, publicCloudProductDetailInclude, tasks } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const product = await prisma.publicCloudProduct.findFirst({
    where: { licencePlate, status: ProjectStatus.ACTIVE },
    include: publicCloudProductDetailInclude,
  });

  if (!product) {
    return BadRequestResponse('invalid product');
  }

  const canRenew =
    product.expenseAuthorityId === session.user.id ||
    session.permissions.reviewPublicCloudBilling ||
    session.isBillingManager;

  if (!canRenew) {
    return UnauthorizedResponse();
  }

  const approvedBilling = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate, approved: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!approvedBilling) {
    return BadRequestResponse('no approved agreement');
  }

  if (approvedBilling.agreementVersion === 2) {
    return BadRequestResponse('agreement is already up to date');
  }

  const unapprovedBillings = await prisma.publicCloudBilling.findMany({
    where: { licencePlate, approved: false },
    select: { id: true },
  });

  const activeTask = await prisma.task.findFirst({
    where: {
      type: {
        in: [TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU],
      },
      status: {
        in: [TaskStatus.ASSIGNED, TaskStatus.STARTED],
      },
      OR: [
        { data: { equals: { licencePlate } } },
        ...unapprovedBillings.map(({ id }) => ({
          data: { equals: { licencePlate, billingId: id } },
        })),
      ],
    },
  });

  if (activeTask) {
    return BadRequestResponse('agreement signing already in progress');
  }

  if (!product.expenseAuthorityId) {
    return BadRequestResponse('invalid expense authority');
  }

  const billing = await prisma.publicCloudBilling.create({
    data: {
      licencePlate,
      accountCoding: approvedBilling.accountCoding,
      agreementVersion: 2,
      expenseAuthority: { connect: { id: product.expenseAuthorityId } },
    },
    include: publicCloudBillingDetailInclude,
  });

  const [billingDecorated, productDecorated] = await Promise.all([
    models.publicCloudBilling.decorate(billing, session, true),
    models.publicCloudProduct.decorate(product, session, true),
  ]);

  await tasks.create(TaskType.SIGN_PUBLIC_CLOUD_MOU, {
    product: productDecorated,
    billing: billingDecorated,
  });

  return OkResponse(billingDecorated);
});
