import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import jws from 'jws';
import _isNil from 'lodash-es/isNil';
import _join from 'lodash-es/join';
import { POST as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { AppUserWithRoles } from '@/types/user';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/private-cloud/products');

const secret = 'testsecret'; // pragma: allowlist secret

interface ListPrivateCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
}

export async function listPrivateCloudProductApi(
  queryParams?: ListPrivateCloudProductApiProps,
  user?: AppUserWithRoles,
) {
  const stringifiedRoles = _join(user?.roles, ',');
  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: stringifiedRoles,
      service_account_type: 'user',
      'kc-userid': user?.id,
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
