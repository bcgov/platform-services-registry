import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { getQuotaChangeStatus } from '@/helpers/auto-approval-check';
import { quotasSchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string().length(6),
});

const bodySchema = z.object({
  requestedQuota: quotasSchema,
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});

export const POST = apiHandler(async ({ session, pathParams, body }) => {
  const { licencePlate } = pathParams;
  const { requestedQuota } = body;

  const currentProduct = await prisma.privateCloudProject.findFirst({
    where: { licencePlate },
    select: {
      cluster: true,
      productionQuota: true,
      testQuota: true,
      developmentQuota: true,
      toolsQuota: true,
    },
    session: session as never,
  });

  if (!currentProduct) {
    return BadRequestResponse(`not allowed for the product (${licencePlate})`);
  }

  const quotaChangeStatus = await getQuotaChangeStatus({
    licencePlate,
    cluster: currentProduct.cluster,
    currentQuota: currentProduct,
    requestedQuota,
  });

  return OkResponse(quotaChangeStatus);
});
