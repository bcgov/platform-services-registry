import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { createRoute } from '../../core';

const privateCloudRoute = createRoute('/v1/private-cloud/products');

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const result = await privateCloudRoute.post(
    _provisionPrivateCloudProduct,
    '/{{idOrLicencePlate}}/provision',
    {},
    {
      pathParams: { idOrLicencePlate },
    },
    getServiceAccountAuthHeader(),
  );

  return result;
}
