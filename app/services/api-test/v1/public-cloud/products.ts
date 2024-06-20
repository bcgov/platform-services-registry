import { GET as _listPublicCloudProject } from '@/app/api/v1/public-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/public-cloud/products');

export async function listPublicCloudProjectApi() {
  const result = await productCollectionRoute.get(_listPublicCloudProject, '', {}, { authorization: 'dummy' });
  return result;
}
