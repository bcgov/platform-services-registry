import { PUT as _provisionPrivateCloudProduct } from '@/app/api/private-cloud/provision/[licencePlate]/route';
import { createRoute } from '../core';

const privateCloudRoute = createRoute('/private-cloud');

export async function provisionPrivateCloudProduct(licencePlate: string) {
  const result = await privateCloudRoute.put(_provisionPrivateCloudProduct, '/provision/{{licencePlate}}', null, {
    pathParams: { licencePlate },
  });

  return result;
}
