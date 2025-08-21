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
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { AccountCoding } from '@/prisma/client';
import {
  PublicCloudProductDetailDecorated,
  PublicCloudProductSimpleDecorated,
  PublicCloudProjectSummary,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSimpleDecorated,
} from '@/types/public-cloud';
import {
  PublicCloudCreateRequestBody,
  PublicCloudEditRequestBody,
  PublicCloudProductSearchBody,
  PublicCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/public-cloud';
import { createRoute, ParamData } from '../core';

const productCollectionRoute = createRoute('/public-cloud/products');

type EmptyDocument = { id: string };

export async function createPublicCloudProduct(
  data: Partial<PublicCloudCreateRequestBody> & {
    projectOwner?: EmptyDocument;
    primaryTechnicalLead?: EmptyDocument;
    secondaryTechnicalLead?: EmptyDocument;
    expenseAuthority?: EmptyDocument;
  },
  paramData?: ParamData,
) {
  data.projectOwnerId = data.projectOwner?.id ?? undefined;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? undefined;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? undefined;
  data.expenseAuthorityId = data.expenseAuthority?.id ?? undefined;

  if (!data.organizationId) {
    const organization = getRandomOrganization();
    data.organizationId = organization.id;
  }

  const result = await productCollectionRoute.post<
    PublicCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(_createPublicCloudProduct, '', data);
  return result;
}

export async function listPublicCloudProduct(data: any) {
  const result = await productCollectionRoute.get(_listPublicCloudProduct, '', data);
  return result;
}

export async function searchPublicCloudProducts(data: Partial<PublicCloudProductSearchBody>) {
  const result = await productCollectionRoute.post<{ docs: PublicCloudProductSimpleDecorated[]; totalCount: number }>(
    _searchPublicCloudProducts,
    '/search',
    data,
  );
  return result;
}

export async function downloadPublicCloudProducts(data: Partial<PublicCloudProductSearchNoPaginationBody>) {
  const result = await productCollectionRoute.post<PublicCloudProjectSummary>(
    _downloadPublicCloudProducts,
    '/download',
    data,
  );
  return result;
}

export async function getPublicCloudProduct(licencePlate: string) {
  const result = await productCollectionRoute.get<PublicCloudProductDetailDecorated>(
    _getPublicCloudProduct,
    '/{{licencePlate}}',
    {
      pathParams: { licencePlate },
    },
  );
  return result;
}

export async function getTransformedLeadFields(
  data: Partial<PublicCloudEditRequestBody> & {
    projectOwner?: { id: string } | null;
    primaryTechnicalLead?: { id: string } | null;
    secondaryTechnicalLead?: { id: string } | null;
    expenseAuthority?: { id: string } | null;
  },
) {
  return {
    ...data,
    projectOwner: data.projectOwner ? { id: data.projectOwner.id } : undefined,
    primaryTechnicalLead: data.primaryTechnicalLead ? { id: data.primaryTechnicalLead.id } : undefined,
    secondaryTechnicalLead: data.secondaryTechnicalLead ? { id: data.secondaryTechnicalLead.id } : undefined,
    expenseAuthority: data.expenseAuthority ? { id: data.expenseAuthority.id } : undefined,
  };
}

export async function editPublicCloudProduct(
  licencePlate: string,
  data: Partial<PublicCloudEditRequestBody> & {
    projectOwner?: { id: string };
    primaryTechnicalLead?: { id: string };
    secondaryTechnicalLead?: { id: string };
    expenseAuthority?: { id: string };
    isAgMinistryChecked?: boolean;
  },
) {
  data.isAgMinistry = true;
  data.isAgMinistryChecked = true;
  data.projectOwnerId = data.projectOwner?.id ?? undefined;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? undefined;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? undefined;
  data.expenseAuthorityId = data.expenseAuthority?.id ?? undefined;

  const result = await productCollectionRoute.put<
    PublicCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(_editPublicCloudProduct, '/{{licencePlate}}', data, {
    pathParams: { licencePlate },
  });
  return result;
}

export async function deletePublicCloudProduct(licencePlate: string, requestComment: string) {
  const result = await productCollectionRoute.post<
    PublicCloudRequestDetailDecorated & { success: boolean; message: string; error: any }
  >(_archivePublicCloudProduct, '/{{licencePlate}}/archive', { requestComment }, { pathParams: { licencePlate } });

  return result;
}

export async function listPublicCloudProductRequests(licencePlate: string, active = false) {
  const result = await productCollectionRoute.get<PublicCloudRequestSimpleDecorated[]>(
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
  const result = await productCollectionRoute.post<true>(
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
  const result = await productCollectionRoute.post<true>(
    _reviewPublicCloudBilling,
    '/{{licencePlate}}/billings/{{billingId}}/review',
    data,
    {
      pathParams: { licencePlate, billingId },
    },
  );
  return result;
}
