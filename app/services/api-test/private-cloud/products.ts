import { POST as _createPrivateCloudProject } from '@/app/api/private-cloud/products/route';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('private-cloud/products');

export async function createPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data, paramData);
  return result;
}

export async function listPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data, paramData);
  return result;
}
