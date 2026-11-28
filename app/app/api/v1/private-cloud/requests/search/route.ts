import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPrivateCloudRequestsForServiceAccount } from '@/services/db/private-cloud-request';
import { privateCloudRequestSearchBodySchema } from '@/validation-schemas/private-cloud';

const requestSearchSchema = privateCloudRequestSearchBodySchema.extend({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(100),
});

export const POST = createApiHandler({
  roles: ['service-account private-admin'],
  useServiceAccount: true,
  validations: {
    body: requestSearchSchema,
  },
})(async ({ body }) => {
  const { docs, totalCount } = await searchPrivateCloudRequestsForServiceAccount(body);

  const page = body.page ?? 1;
  const pageSize = body.pageSize ?? 100;

  return OkResponse({
    success: true,
    data: docs,
    totalCount,
    pagination: {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      take: pageSize,
    },
  });
});
