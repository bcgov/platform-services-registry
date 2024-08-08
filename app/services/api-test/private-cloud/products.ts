import {
  GET as _getPrivateCloudComment,
  PUT as _updatePrivateCloudComment,
  DELETE as _deletePrivateCloudComment,
} from '@/app/api/private-cloud/products/[licencePlate]/comments/[commentId]/route';
import {
  POST as _createPrivateCloudComment,
  GET as _listPrivateCloudComments,
} from '@/app/api/private-cloud/products/[licencePlate]/comments/route';
import { GET as _listPrivateCloudProductRequests } from '@/app/api/private-cloud/products/[licencePlate]/requests/route';
import {
  GET as _getPrivateCloudProject,
  PUT as _editPrivateCloudProject,
  DELETE as _deletePrivateCloudProject,
} from '@/app/api/private-cloud/products/[licencePlate]/route';
import { POST as _downloadPrivateCloudProjects } from '@/app/api/private-cloud/products/download/route';
import {
  GET as _listPrivateCloudProject,
  POST as _createPrivateCloudProject,
} from '@/app/api/private-cloud/products/route';
import { POST as _searchPrivateCloudProjects } from '@/app/api/private-cloud/products/search/route';
import {
  PrivateCloudEditRequestBody,
  PrivateCloudProductSearchBody,
  PrivateCloudProductSearchNoPaginationBody,
} from '@/schema';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/private-cloud/products');

// Private Cloud Projects
export async function createPrivateCloudProject(data: any, paramData?: ParamData) {
  const result = await productCollectionRoute.post(_createPrivateCloudProject, '', data);
  return result;
}

export async function listPrivateCloudProject(data: any) {
  const result = await productCollectionRoute.get(_listPrivateCloudProject, '', data);
  return result;
}

export async function searchPrivateCloudProjects(data: Partial<PrivateCloudProductSearchBody>) {
  const result = await productCollectionRoute.post(_searchPrivateCloudProjects, '/search', data);
  return result;
}

export async function downloadPrivateCloudProjects(data: Partial<PrivateCloudProductSearchNoPaginationBody>) {
  const result = await productCollectionRoute.post(_downloadPrivateCloudProjects, '/download', data);
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

export async function listPrivateCloudProductRequests(licencePlate: string, active = false) {
  const result = await productCollectionRoute.get(
    _listPrivateCloudProductRequests,
    `/{{licencePlate}}/requests?active=${active}`,
    {
      pathParams: { licencePlate },
    },
  );
  return result;
}

// Private Cloud Comments
export async function createPrivateCloudComment(licencePlate: string, data: any) {
  const result = await productCollectionRoute.post(_createPrivateCloudComment, '/{{licencePlate}}/comments', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function getAllPrivateCloudComments(licencePlate: string, requestId?: string) {
  const queryParams = requestId ? { requestId } : {};
  const result = await productCollectionRoute.get(_listPrivateCloudComments, '/{{licencePlate}}/comments', {
    pathParams: { licencePlate },
    queryParams,
  });
  return result;
}

export async function getPrivateCloudComment(licencePlate: string, commentId: string) {
  const result = await productCollectionRoute.get(_getPrivateCloudComment, '/{{licencePlate}}/comments/{{commentId}}', {
    pathParams: { licencePlate, commentId },
  });
  return result;
}

export async function updatePrivateCloudComment(licencePlate: string, commentId: string, data: any) {
  const result = await productCollectionRoute.put(
    _updatePrivateCloudComment,
    '/{{licencePlate}}/comments/{{commentId}}',
    data,
    {
      pathParams: { licencePlate, commentId },
    },
  );
  return result;
}

export async function deletePrivateCloudComment(licencePlate: string, commentId: string) {
  const result = await productCollectionRoute.delete(
    _deletePrivateCloudComment,
    '/{{licencePlate}}/comments/{{commentId}}',
    {
      pathParams: { licencePlate, commentId },
    },
  );
  return result;
}
