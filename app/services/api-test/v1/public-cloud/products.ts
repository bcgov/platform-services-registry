import { Ministry, Provider, ProjectStatus } from '@prisma/client';
import _isNil from 'lodash-es/isNil';
import _join from 'lodash-es/join';
import { GET as _listPublicCloudProduct } from '@/app/api/v1/public-cloud/products/route';
import { getUserServiceAccountAuthHeader } from '@/helpers/mock-resources';
import { AppUserWithRoles } from '@/types/user';
import { createRoute } from '../../core';

const productCollectionRoute = createRoute('/api/v1/public-cloud/products');

interface ListPublicCloudProductApiProps {
  page?: number;
  pageSize?: number;
  ministry?: Ministry;
  provider?: Provider;
  status?: ProjectStatus;
}

export async function listPublicCloudProductApi(queryParams?: ListPublicCloudProductApiProps, user?: AppUserWithRoles) {
  const result = await productCollectionRoute.get(
    _listPublicCloudProduct,
    '',
    { queryParams: queryParams || {} },
    getUserServiceAccountAuthHeader(user),
  );

  return result;
}
