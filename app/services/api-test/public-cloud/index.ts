import { PUT as _provisionPublicCloudProduct } from '@/app/api/public-cloud/provision/[licencePlate]/route';
import { createRoute } from '../core';

const publicCloudRoute = createRoute('/public-cloud');

export async function provisionPublicCloudProduct(licencePlate: string) {
  const result = await publicCloudRoute.put(_provisionPublicCloudProduct, '/provision/{{licencePlate}}', null, {
    pathParams: { licencePlate },
  });

  return result;
}
