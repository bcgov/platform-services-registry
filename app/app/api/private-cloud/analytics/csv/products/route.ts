import { numberOfProductsOverTime } from '@/analytics/private-cloud/products';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await numberOfProductsOverTime();
  return CsvResponse(data, 'products-over-time.csv');
});
