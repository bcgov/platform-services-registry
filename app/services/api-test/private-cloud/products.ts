import { POST as _archivePrivateCloudProduct } from '@/app/api/private-cloud/products/[licencePlate]/archive/route';
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
  GET as _getPrivateCloudProduct,
  PUT as _editPrivateCloudProduct,
} from '@/app/api/private-cloud/products/[licencePlate]/route';
import { POST as _downloadPrivateCloudProducts } from '@/app/api/private-cloud/products/download/route';
import {
  GET as _listPrivateCloudProduct,
  POST as _createPrivateCloudProduct,
} from '@/app/api/private-cloud/products/route';
import { POST as _searchPrivateCloudProducts } from '@/app/api/private-cloud/products/search/route';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { Prisma } from '@/prisma/client';
import { PrivateProductCsvRecord } from '@/types/csv';
import {
  PrivateCloudComment,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSimpleDecorated,
  PrivateCloudRequestDetailDecorated,
} from '@/types/private-cloud';
import {
  PrivateCloudCreateRequestBody,
  PrivateCloudEditRequestBody,
  PrivateCloudProductSearchBody,
  PrivateCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/private-cloud';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/private-cloud/products');

// Private Cloud Projects
export async function createPrivateCloudProduct(
  data: Partial<PrivateCloudCreateRequestBody> & {
    projectOwner?: { id: string };
    primaryTechnicalLead?: { id: string };
    secondaryTechnicalLead?: { id: string };
  },
) {
  data.projectOwnerId = data.projectOwner?.id ?? undefined;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? undefined;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? undefined;

  if (!data.organizationId) {
    const organization = getRandomOrganization();
    data.organizationId = organization.id;
  }

  const result = await productCollectionRoute.post<
    PrivateCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(_createPrivateCloudProduct, '', data);
  return result;
}

export async function listPrivateCloudProduct(data: any) {
  const result = await productCollectionRoute.get(_listPrivateCloudProduct, '', data);
  return result;
}

export async function searchPrivateCloudProducts(data: Partial<PrivateCloudProductSearchBody>) {
  const result = await productCollectionRoute.post<{ docs: PrivateCloudProductSimpleDecorated[]; totalCount: number }>(
    _searchPrivateCloudProducts,
    '/search',
    data,
  );
  return result;
}

export async function downloadPrivateCloudProducts(data: Partial<PrivateCloudProductSearchNoPaginationBody>) {
  const result = await productCollectionRoute.post<PrivateProductCsvRecord[]>(
    _downloadPrivateCloudProducts,
    '/download',
    data,
  );
  return result;
}

export async function getPrivateCloudProduct(licencePlate: string) {
  const result = await productCollectionRoute.get<PrivateCloudProductDetailDecorated>(
    _getPrivateCloudProduct,
    '/{{licencePlate}}',
    {
      pathParams: { licencePlate },
    },
  );
  return result;
}

export async function editPrivateCloudProduct(licencePlate: string, data: PrivateCloudEditRequestBody) {
  data.isAgMinistry = true;
  data.isAgMinistryChecked = true;

  const result = await productCollectionRoute.put<
    PrivateCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(_editPrivateCloudProduct, '/{{licencePlate}}', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function deletePrivateCloudProduct(licencePlate: string, requestComment: string) {
  const result = await productCollectionRoute.post<
    PrivateCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(
    _archivePrivateCloudProduct,
    '/{{licencePlate}}/archive',
    { requestComment },
    {
      pathParams: { licencePlate },
    },
  );
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
export async function createPrivateCloudComment(
  licencePlate: string,
  data: { text: string; projectId?: string; requestId?: string },
) {
  const result = await productCollectionRoute.post<
    Prisma.PrivateCloudCommentGetPayload<{}> & { success: boolean; message: string; error: any }
  >(_createPrivateCloudComment, '/{{licencePlate}}/comments', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function getAllPrivateCloudComments(licencePlate: string, requestId?: string) {
  const queryParams = requestId ? { requestId } : {};
  const result = await productCollectionRoute.get<PrivateCloudComment[]>(
    _listPrivateCloudComments,
    '/{{licencePlate}}/comments',
    {
      pathParams: { licencePlate },
      queryParams,
    },
  );
  return result;
}

export async function getPrivateCloudComment(licencePlate: string, commentId: string) {
  const result = await productCollectionRoute.get<Prisma.PrivateCloudCommentGetPayload<{}>>(
    _getPrivateCloudComment,
    '/{{licencePlate}}/comments/{{commentId}}',
    {
      pathParams: { licencePlate, commentId },
    },
  );
  return result;
}

export async function updatePrivateCloudComment(licencePlate: string, commentId: string, data: { text: string }) {
  const result = await productCollectionRoute.put<PrivateCloudComment>(
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
  const result = await productCollectionRoute.delete<{ success: boolean }>(
    _deletePrivateCloudComment,
    '/{{licencePlate}}/comments/{{commentId}}',
    {
      pathParams: { licencePlate, commentId },
    },
  );
  return result;
}
