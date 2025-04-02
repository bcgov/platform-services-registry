import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import jws from 'jws';
import _isNil from 'lodash-es/isNil';
import { POST as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/v1/private-cloud/products');

const secret = 'testsecret'; // pragma: allowlist secret

interface ListPrivateCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
}

export async function listPrivateCloudProductApi(queryParams?: ListPrivateCloudProductApiProps) {
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: 'private-admin',
      service_account_type: 'team',
    },
    secret,
  });

  const result = await productCollectionRoute.post(
    _listPrivateCloudProduct,
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
