import jws from 'jws';
import { POST as _provisionPublicCloudProduct } from '@/app/api/v1/public-cloud/products/[idOrLicencePlate]/provision/route';
import { createRoute } from '../../core';

const publicCloudRoute = createRoute('/v1/public-cloud/products');

const secret = 'testsecret'; // pragma: allowlist secret

export async function provisionPublicCloudProduct(idOrLicencePlate: string) {
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: 'public-admin',
      service_account_type: 'team',
    },
    secret,
  });

  const result = await publicCloudRoute.post(
    _provisionPublicCloudProduct,
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
