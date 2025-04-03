import jws from 'jws';
import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import { getProvisionTestAuthHeader } from '@/helpers/mock-resources';
import { createRoute } from '../../core';

const privateCloudRoute = createRoute('/v1/private-cloud/products');

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const result = await privateCloudRoute.post(
    _provisionPrivateCloudProduct,
    '/{{idOrLicencePlate}}/provision',
    JSON.stringify({}),
    {
      pathParams: { idOrLicencePlate },
    },
    getProvisionTestAuthHeader(),
  );

  return result;
}
