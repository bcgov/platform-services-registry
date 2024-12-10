import { GET as _listPublicCloudProductRequests } from '@/app/api/public-cloud/products/[licencePlate]/requests/route';
import { POST as _reviewPublicCloudMou } from '@/app/api/public-cloud/products/[licencePlate]/review-mou/route';
import {
  GET as _getPublicCloudProject,
  PUT as _editPublicCloudProject,
  DELETE as _deletePublicCloudProject,
} from '@/app/api/public-cloud/products/[licencePlate]/route';
import { POST as _signPublicCloudMou } from '@/app/api/public-cloud/products/[licencePlate]/sign-mou/route';
import { POST as _downloadPublicCloudProjects } from '@/app/api/public-cloud/products/download/route';
import {
  GET as _listPublicCloudProject,
  POST as _createPublicCloudProject,
} from '@/app/api/public-cloud/products/route';
import { POST as _searchPublicCloudProjects } from '@/app/api/public-cloud/products/search/route';
import {
  PublicCloudEditRequestBody,
  PublicCloudProductSearchBody,
  PublicCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/public-cloud';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/public-cloud/products');

export async function createPublicCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPublicCloudProject, '', data);
  return result;
}

export async function listPublicCloudProject(data: any) {
  const result = await productCollectionRoute.get(_listPublicCloudProject, '', data);
  return result;
}

export async function searchPublicCloudProjects(data: Partial<PublicCloudProductSearchBody>) {
  const result = await productCollectionRoute.post(_searchPublicCloudProjects, '/search', data);
  return result;
}

export async function downloadPublicCloudProjects(data: Partial<PublicCloudProductSearchNoPaginationBody>) {
  const result = await productCollectionRoute.post(_downloadPublicCloudProjects, '/download', data);
  return result;
}

export async function getPublicCloudProject(licencePlate: string) {
  const result = await productCollectionRoute.get(_getPublicCloudProject, '/{{licencePlate}}', {
    pathParams: { licencePlate },
  });
  return result;
}

export async function editPublicCloudProject(licencePlate: string, data: PublicCloudEditRequestBody) {
  data.isAgMinistryChecked = true;

  const result = await productCollectionRoute.put(_editPublicCloudProject, '/{{licencePlate}}', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function deletePublicCloudProject(licencePlate: string) {
  const result = await productCollectionRoute.delete(_deletePublicCloudProject, '/{{licencePlate}}', {
    pathParams: { licencePlate },
  });

  return result;
}

export async function listPublicCloudProductRequests(licencePlate: string, active = false) {
  const result = await productCollectionRoute.get(
    _listPublicCloudProductRequests,
    `/{{licencePlate}}/requests?active=${active}`,
    {
      pathParams: { licencePlate },
    },
  );

  return result;
}

export async function signPublicCloudMou(licencePlate: string, data: { taskId: string; confirmed: boolean }) {
  const result = await productCollectionRoute.post(_signPublicCloudMou, '/{{licencePlate}}/sign-mou', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function reviewPublicCloudMou(licencePlate: string, data: { taskId: string; decision: string }) {
  const result = await productCollectionRoute.post(_reviewPublicCloudMou, '/{{licencePlate}}/review-mou', data, {
    pathParams: { licencePlate },
  });
  return result;
}
