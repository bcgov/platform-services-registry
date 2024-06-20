import { GET as _listPrivateCloudProject } from '@/app/api/v1/private-cloud/products/route';
import { createRoute, ParamData } from '../../core';

const productCollectionRoute = createRoute('/api/private-cloud/products');

export async function listPrivateCloudProjectApi() {
  const result = await productCollectionRoute.get(_listPrivateCloudProject, '', {}, { authorization: 'dummy' });
  return result;
}
