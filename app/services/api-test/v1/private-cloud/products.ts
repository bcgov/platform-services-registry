import { GET as _listPrivateCloudProduct } from '@/app/api/v1/private-cloud/products/route';
import { getServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { Ministry, Cluster, ProjectStatus } from '@/prisma/client';
import { PrivateCloudProductSimpleDecorated } from '@/types/private-cloud';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/private-cloud/products');

interface ListPrivateCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
}

interface ListPrivateCloudProduct {
  success: boolean;
  message: string;
  error: any;
  data: PrivateCloudProductSimpleDecorated[];
  totalCount: number;
  pagination: {
    page: number | undefined;
    pageSize: number | undefined;
    skip: number | undefined;
    take: number | undefined;
  };
}

export async function listPrivateCloudProductApi(queryParams?: ListPrivateCloudProductApiProps) {
  const result = await productCollectionRoute.get<ListPrivateCloudProduct>(
    _listPrivateCloudProduct,
    '',
    { queryParams: queryParams || {} },
    getServiceAccountAuthHeader(),
  );

  return result;
}
