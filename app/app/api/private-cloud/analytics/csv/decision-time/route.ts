import { requestDecisionTime } from '@/analytics/private-cloud/request-decision-time';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await requestDecisionTime();
  return CsvResponse(data, 'requst-decision-time.csv');
});
