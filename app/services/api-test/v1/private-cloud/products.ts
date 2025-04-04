import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import _join from 'lodash-es/join';
import { GET as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/private-cloud/products');

interface ListPrivateCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
}

export async function listPrivateCloudProductApi(queryParams?: ListPrivateCloudProductApiProps) {
  const result = await productCollectionRoute.get(
    _listPrivateCloudProduct,
    '',
    { queryParams: queryParams || {} },
    getServiceAccountAuthHeader(),
  );

  return result;
}
