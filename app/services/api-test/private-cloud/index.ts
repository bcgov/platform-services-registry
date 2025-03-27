import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import { createRoute } from '../core';

const privateCloudRoute = createRoute('/v1/private-cloud/products');

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const result = await privateCloudRoute.post(_provisionPrivateCloudProduct, '/{{idOrLicencePlate}}/provision', null, {
    pathParams: { idOrLicencePlate },
  });

  return result;
}
