import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getQuotaChangeStatus } from '@/helpers/auto-approval-check';
import { models } from '@/services/db';
import { resourceRequestsEnvSchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string().length(6),
});

const bodySchema = z.object({
  resourceRequests: resourceRequestsEnvSchema,
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: bodySchema },
});

export const POST = apiHandler(async ({ session, pathParams, body }) => {
  const { licencePlate } = pathParams;
  const { resourceRequests } = body;

  const { data: currentProduct } = await models.privateCloudProduct.get(
    {
      where: { licencePlate },
      select: {
        cluster: true,
        resourceRequests: true,
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
    currentResourceRequests: currentProduct.resourceRequests,
    requestedResourceRequests: resourceRequests,
  });

  return OkResponse(quotaChangeStatus);
});
