import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import {
  DELETE as _removePrivateCloudProductRepository,
  POST as _addPrivateCloudProductRepository,
} from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/repositories/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { createRoute } from '../../core';

const privateCloudRoute = createRoute('/v1/private-cloud/products');

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const result = await privateCloudRoute.post<{ success: boolean; message: string }>(
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

export async function addPrivateCloudProductRepository(idOrLicencePlate: string, url: string) {
  const result = await privateCloudRoute.post<{ success: boolean; message: string }>(
    _addPrivateCloudProductRepository,
    '/{{idOrLicencePlate}}/repositories',
    { url },
    {
      pathParams: { idOrLicencePlate },
    },
    getServiceAccountAuthHeader(),
  );

  return result;
}

export async function removePrivateCloudProductRepository(idOrLicencePlate: string, url: string) {
  const result = await privateCloudRoute.delete<{ success: boolean; message: string }>(
    _removePrivateCloudProductRepository,
    '/{{idOrLicencePlate}}/repositories',
    {
      pathParams: { idOrLicencePlate },
      queryParams: { url },
    },
    getServiceAccountAuthHeader(),
  );

  return result;
}
