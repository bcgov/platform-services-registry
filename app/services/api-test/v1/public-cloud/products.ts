import { Ministry, Provider, ProjectStatus } from '@prisma/client';
import jws from 'jws';
import _isNil from 'lodash-es/isNil';
import { POST as _listPublicCloudProduct } from '@/app/api/v1/public-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/v1/public-cloud/products');

const secret = 'testsecret'; // pragma: allowlist secret

interface ListPublicCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  provider?: Provider;
  status?: ProjectStatus;
}

export async function listPublicCloudProductApi(queryParams?: ListPublicCloudProductApiProps) {
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: 'private-admin',
      service_account_type: 'team',
    },
    secret,
  });
  const result = await productCollectionRoute.post(
    _listPublicCloudProduct,
    '',
    JSON.stringify({}),
    { queryParams: queryParams || {} },
    {
      Authorization: 'Bearer ' + signature,
      'Content-Type': 'application/json',
    },
  );

  return result;
}
