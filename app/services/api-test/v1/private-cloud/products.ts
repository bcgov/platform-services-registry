import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import _join from 'lodash-es/join';
import { POST as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { getUserTestAuthHeader } from '@/helpers/mock-resources';
import { AppUserWithRoles } from '@/types/user';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/private-cloud/products');

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
  const result = await productCollectionRoute.post(
    _listPrivateCloudProduct,
    '',
    JSON.stringify({}),
    { queryParams: queryParams || {} },
    getUserTestAuthHeader(user),
  );

  return result;
}
