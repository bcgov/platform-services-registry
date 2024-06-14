import {
  GET as _getPrivateCloudProject,
  PUT as _editPrivateCloudProject,
  DELETE as _deletePrivateCloudProject,
} from '@/app/api/private-cloud/products/[licencePlate]/route';
import {
  GET as _listPrivateCloudProject,
  POST as _createPrivateCloudProject,
} from '@/app/api/private-cloud/products/route';
import { POST as _searchPrivateCloudProjects } from '@/app/api/private-cloud/products/search/route';
import { PrivateCloudEditRequestBody, PrivateCloudSearchBody } from '@/schema';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/private-cloud/products');

export async function createPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data);
  return result;
}

export async function listPrivateCloudProject(data: any) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data);
  return result;
}

export async function searchPrivateCloudProjects(data: Partial<PrivateCloudSearchBody>) {
  const result = await productCollectionRoute.post(_searchPrivateCloudProjects, '/search', data);
  return result;
}

export async function getPrivateCloudProject(licencePlate: string) {
  const result = await productCollectionRoute.get(_getPrivateCloudProject, '/{{licencePlate}}', {
    pathParams: { licencePlate },
  });
  return result;
}

export async function editPrivateCloudProject(licencePlate: string, data: PrivateCloudEditRequestBody) {
  const result = await productCollectionRoute.put(_editPrivateCloudProject, '/{{licencePlate}}', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await productCollectionRoute.delete(_deletePrivateCloudProject, '/{{licencePlate}}', {
    pathParams: { licencePlate },
  });

  return result;
}
