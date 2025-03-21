import { Ministry, Provider, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import { GET as _listPublicCloudProduct } from '@/app/api/v1/public-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/public-cloud/products');

interface ListPublicCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  provider?: Provider;
  status?: ProjectStatus;
}

export async function listPublicCloudProductApi(queryParams?: ListPublicCloudProductApiProps) {
  const result = await productCollectionRoute.get(
    _listPublicCloudProduct,
    '',
    { queryParams: queryParams || {} },
    { authorization: 'dummy' },
  );

  return result;
}
