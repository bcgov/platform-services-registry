import { GET as _listPublicCloudProduct } from '@/app/api/v1/public-cloud/products/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { Provider, ProjectStatus } from '@/prisma/client';
import { PublicCloudProductSimpleDecorated } from '@/types/public-cloud';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/public-cloud/products');

interface ListPublicCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: string;
  provider?: Provider;
  status?: ProjectStatus;
}

interface ListPublicCloudProduct {
  success: boolean;
  message: string;
  error: any;
  data: PublicCloudProductSimpleDecorated[];
  totalCount: number;
  pagination: {
    page: number | undefined;
    pageSize: number | undefined;
    skip: number | undefined;
    take: number | undefined;
  };
}

export async function listPublicCloudProductApi(queryParams?: ListPublicCloudProductApiProps) {
  const result = await productCollectionRoute.get<ListPublicCloudProduct>(
    _listPublicCloudProduct,
    '',
    { queryParams: queryParams || {} },
    getServiceAccountAuthHeader(),
  );

  return result;
}
