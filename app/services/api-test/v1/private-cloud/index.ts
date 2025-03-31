import jws from 'jws';
import { POST as _provisionPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/[idOrLicencePlate]/provision/route';
import { createRoute } from '../../core';

const privateCloudRoute = createRoute('/v1/private-cloud/products');

const secret = 'testsecret'; // pragma: allowlist secret

export async function provisionPrivateCloudProduct(idOrLicencePlate: string) {
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {},
    secret,
  });

  // handler: Handler, url: string, data: any, paramData?: ParamData, headers?: any
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
