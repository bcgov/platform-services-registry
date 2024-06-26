import { Ministry, Cluster, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import { GET as _listPrivateCloudProject } from '@/app/api/v1/private-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/private-cloud/products');

interface ListPrivateCloudProjectApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
}

export async function listPrivateCloudProjectApi(queryParams?: ListPrivateCloudProjectApiProps) {
  const result = await productCollectionRoute.get(
    _listPrivateCloudProject,
    '',
    { queryParams: queryParams || {} },
    { authorization: 'dummy' },
  );

  return result;
}
