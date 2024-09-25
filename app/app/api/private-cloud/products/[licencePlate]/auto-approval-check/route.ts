import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { checkIfQuotaAutoApproval } from '@/helpers/auto-approval-check';
import { quotaSchema } from '@/validation-schemas/private-cloud';

const quotasSchema = z.object({
  testQuota: quotaSchema,
  toolsQuota: quotaSchema,
  developmentQuota: quotaSchema,
  productionQuota: quotaSchema,
});

const bodySchema = z.object({
  licencePlate: z.string().length(6),
  requestedQuota: quotasSchema,
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { body: bodySchema },
});

export const POST = apiHandler(async ({ body }) => {
  const { licencePlate, requestedQuota } = body;

  const currentProduct = await prisma.privateCloudProject.findFirst({
    where: { licencePlate },
    select: {
      cluster: true,
      productionQuota: true,
      testQuota: true,
      developmentQuota: true,
      toolsQuota: true,
    },
  });

  if (!currentProduct) {
    return BadRequestResponse(`failed to get product data for ${licencePlate} licencePlate`);
  }

  const currentQuota = {
    testQuota: currentProduct.testQuota,
    toolsQuota: currentProduct.toolsQuota,
    developmentQuota: currentProduct.developmentQuota,
    productionQuota: currentProduct.productionQuota,
  };

  const quotaChangesReview = await checkIfQuotaAutoApproval(
    currentQuota,
    requestedQuota,
    licencePlate,
    currentProduct.cluster,
  );
  return OkResponse(quotaChangesReview);
});
