import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { checkIfAutoApproval } from '@/helpers/auto-approval-check';

const quotaSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
  storage: z.string(),
});

const quotasSchema = z.object({
  testQuota: quotaSchema,
  toolsQuota: quotaSchema,
  developmentQuota: quotaSchema,
  productionQuota: quotaSchema,
});

const queryParamSchema = z.object({
  licencePlate: z.string(),
  cluster: z.string(),
  currentQuota: quotasSchema,
  requestedQuota: quotasSchema,
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const POST = apiHandler(async ({ queryParams }) => {
  const { currentQuota, requestedQuota, licencePlate, cluster } = queryParams;
  const users = await checkIfAutoApproval(currentQuota, requestedQuota, licencePlate, cluster);
  return OkResponse(users);
});
