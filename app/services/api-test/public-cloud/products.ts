import { POST as _archivePublicCloudProduct } from '@/app/api/public-cloud/products/[licencePlate]/archive/route';
import { POST as _reviewPublicCloudBilling } from '@/app/api/public-cloud/products/[licencePlate]/billings/[billingId]/review/route';
import { POST as _signPublicCloudBilling } from '@/app/api/public-cloud/products/[licencePlate]/billings/[billingId]/sign/route';
import { GET as _listPublicCloudProductRequests } from '@/app/api/public-cloud/products/[licencePlate]/requests/route';
import {
  GET as _getPublicCloudProduct,
  PUT as _editPublicCloudProduct,
} from '@/app/api/public-cloud/products/[licencePlate]/route';
import { POST as _downloadPublicCloudProducts } from '@/app/api/public-cloud/products/download/route';
import {
  GET as _listPublicCloudProduct,
  POST as _createPublicCloudProduct,
} from '@/app/api/public-cloud/products/route';
import { POST as _searchPublicCloudProducts } from '@/app/api/public-cloud/products/search/route';
import { AccountCoding } from '@/prisma/client';
import {
  PublicCloudEditRequestBody,
  PublicCloudProductSearchBody,
  PublicCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/public-cloud';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/public-cloud/products');

export async function createPublicCloudProduct(data: any, paramData?: ParamData) {
  data.projectOwnerId = data.projectOwner?.id ?? null;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? null;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? null;
  data.expenseAuthorityId = data.expenseAuthority?.id ?? null;

  const result = await productCollectionRoute.post(_createPublicCloudProduct, '', data);
  return result;
}

export async function listPublicCloudProduct(data: any) {
  const result = await productCollectionRoute.get(_listPublicCloudProduct, '', data);
  return result;
}

export async function searchPublicCloudProducts(data: Partial<PublicCloudProductSearchBody>) {
  const result = await productCollectionRoute.post(_searchPublicCloudProducts, '/search', data);
  return result;
}

export async function downloadPublicCloudProducts(data: Partial<PublicCloudProductSearchNoPaginationBody>) {
  const result = await productCollectionRoute.post(_downloadPublicCloudProducts, '/download', data);
  return result;
}

export async function getPublicCloudProduct(licencePlate: string) {
  const result = await productCollectionRoute.get(_getPublicCloudProduct, '/{{licencePlate}}', {
    pathParams: { licencePlate },
  });
  return result;
}

type EmptyDocument = { id: string };

export async function editPublicCloudProduct(
  licencePlate: string,
  data: PublicCloudEditRequestBody & {
    projectOwner: EmptyDocument;
    primaryTechnicalLead: EmptyDocument;
    secondaryTechnicalLead: EmptyDocument;
    expenseAuthority: EmptyDocument;
  },
) {
  data.isAgMinistryChecked = true;
  data.projectOwnerId = data.projectOwner?.id ?? null;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? null;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? null;
  data.expenseAuthorityId = data.expenseAuthority?.id ?? null;

  const result = await productCollectionRoute.put(_editPublicCloudProduct, '/{{licencePlate}}', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function deletePublicCloudProduct(licencePlate: string, requestComment: string) {
  const result = await productCollectionRoute.post(
    _archivePublicCloudProduct,
    '/{{licencePlate}}/archive',
    { requestComment },
    { pathParams: { licencePlate } },
  );

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

export async function signPublicCloudBilling(
  licencePlate: string,
  billingId: string,
  data: { accountCoding: AccountCoding; confirmed: boolean },
) {
  const result = await productCollectionRoute.post(
    _signPublicCloudBilling,
    '/{{licencePlate}}/billings/{{billingId}}/sign',
    data,
    {
      pathParams: { licencePlate, billingId },
    },
  );
  return result;
}

export async function reviewPublicCloudBilling(licencePlate: string, billingId: string, data: { decision: string }) {
  const result = await productCollectionRoute.post(
    _reviewPublicCloudBilling,
    '/{{licencePlate}}/billings/{{billingId}}/review',
    data,
    {
      pathParams: { licencePlate, billingId },
    },
  );
  return result;
}
