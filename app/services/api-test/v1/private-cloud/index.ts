import jws from 'jws';
import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import { createRoute } from '../../core';

const secret = 'testsecret'; // pragma: allowlist secret

const privateCloudRoute = createRoute('/v1/private-cloud/products');

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: 'private-admin',
      service_account_type: 'team',
    },
    secret,
  });

  const result = await privateCloudRoute.post(
    _provisionPrivateCloudProduct,
    '/{{idOrLicencePlate}}/provision',
    JSON.stringify({}),
    {
      pathParams: { idOrLicencePlate },
    },
    {
      Authorization: 'Bearer ' + signature,
      'Content-Type': 'application/json',
    },
  );

  return result;
}
