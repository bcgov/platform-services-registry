import createApiHandler from '@/core/api-handler';
import { numberOfProductsOverTime } from '@/analytics/public-cloud/products';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data = await numberOfProductsOverTime();
  return CsvResponse(data, 'products-over-time.csv');
});
