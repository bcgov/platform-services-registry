import {
  GET as _getPrivateCloudProject,
  PUT as _editPrivateCloudProject,
  DELETE as _deletePrivateCloudProject,
} from '@/app/api/private-cloud/products/[licencePlate]/route';
import {
  GET as _listPrivateCloudProject,
  POST as _createPrivateCloudProject,
} from '@/app/api/private-cloud/products/route';
import { PUT as _provisionPrivateCloudProject } from '@/app/api/private-cloud/provision/[licencePlate]/route';
import { PrivateCloudEditRequestBody } from '@/schema';
import { createRoute, ParamData } from '../core';

const privateCloudRoute = createRoute('/private-cloud');
const productCollectionRoute = createRoute('/private-cloud/products');
const productResourceRoute = createRoute('/private-cloud/products/{{licencePlate}}');

export async function createPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data, paramData);
  return result;
}

export async function listPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data, paramData);
  return result;
}

export async function getPrivateCloudProject(paramData?: ParamData) {
  const result = await productResourceRoute.get(_getPrivateCloudProject, '', paramData);
  return result;
}

export async function editPrivateCloudProject(licencePlate: string, data: PrivateCloudEditRequestBody) {
  const result = await productResourceRoute.put(_editPrivateCloudProject, '', data, { pathParams: { licencePlate } });
  return result;
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await productResourceRoute.delete(_deletePrivateCloudProject, '', {
    pathParams: { licencePlate },
  });

  return result;
}

export async function provisionPrivateCloudProject(licencePlate: string) {
  const result = await productResourceRoute.put(_provisionPrivateCloudProject, '/provision/{{licencePlate}}', null, {
    pathParams: { licencePlate },
  });

  return result;
}
