import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { upsertConsumptionHistory } from '@/services/db/public-cloud-forecast';
import { cspConsumptionHistorySchema } from '@/validation-schemas/cloud-cost';

export const PUT = createApiHandler({
  roles: ['service-account'],
  useServiceAccount: true,
  validations: { body: cspConsumptionHistorySchema },
})(async ({ body }) => {
  const history = await upsertConsumptionHistory(body);
  return OkResponse(history);
});
