import { Ministry, Provider, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import { GET as _listPublicCloudProject } from '@/app/api/v1/public-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/public-cloud/products');

interface ListPublicCloudProjectApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  provider?: Provider;
  status?: ProjectStatus;
}

export async function listPublicCloudProjectApi(queryParams?: ListPublicCloudProjectApiProps) {
  const result = await productCollectionRoute.get(
    _listPublicCloudProject,
    '',
    { queryParams: queryParams || {} },
    { authorization: 'dummy' },
  );

  return result;
}
