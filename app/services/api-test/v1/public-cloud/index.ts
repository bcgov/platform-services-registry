import { POST as _provisionPublicCloudProduct } from '@/app/api/v1/public-cloud/products/[idOrLicencePlate]/provision/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { createRoute } from '../../core';

const publicCloudRoute = createRoute('/v1/public-cloud/products');

export async function provisionPublicCloudProduct(idOrLicencePlate: string) {
  const result = await publicCloudRoute.post(
    _provisionPublicCloudProduct,
    '/{{idOrLicencePlate}}/provision',
    {},
    {
      pathParams: { idOrLicencePlate },
    },
    getServiceAccountAuthHeader(),
  );
  return result;
}
