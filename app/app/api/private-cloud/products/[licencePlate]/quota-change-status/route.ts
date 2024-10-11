import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getQuotaChangeStatus } from '@/helpers/auto-approval-check';
import { models } from '@/services/db';
import { quotasSchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string().length(6),
});

const bodySchema = z.object({
  requestedQuota: quotasSchema,
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});

export const POST = apiHandler(async ({ session, pathParams, body }) => {
  const { licencePlate } = pathParams;
  const { requestedQuota } = body;

  const { data: currentProduct } = await models.privateCloudProduct.get(
    {
      where: { licencePlate },
      select: {
        cluster: true,
        productionQuota: true,
        testQuota: true,
        developmentQuota: true,
        toolsQuota: true,
      },
    },
    session,
  );

  if (!currentProduct) {
    return UnauthorizedResponse();
  }

  const quotaChangeStatus = await getQuotaChangeStatus({
    licencePlate,
    cluster: currentProduct.cluster,
    currentQuota: currentProduct,
    requestedQuota,
  });

  return OkResponse(quotaChangeStatus);
});
