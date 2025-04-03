import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import _join from 'lodash-es/join';
import { GET as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { getUserServiceAccountAuthHeader } from '@/helpers/mock-resources';
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
  const result = await productCollectionRoute.get(
    _listPrivateCloudProduct,
    '',
    { queryParams: queryParams || {} },
    getUserServiceAccountAuthHeader(user),
  );

  return result;
}
