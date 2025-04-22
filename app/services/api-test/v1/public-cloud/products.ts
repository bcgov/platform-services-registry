import { GET as _listPublicCloudProduct } from '@/app/api/v1/public-cloud/products/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { Ministry, Provider, ProjectStatus } from '@/prisma/types';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/public-cloud/products');

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
    getServiceAccountAuthHeader(),
  );

  return result;
}
