import { numberOfProductsOverTime } from '@/analytics/public-cloud/products';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPublicAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await numberOfProductsOverTime();
  return CsvResponse(data, 'products-over-time.csv');
});
