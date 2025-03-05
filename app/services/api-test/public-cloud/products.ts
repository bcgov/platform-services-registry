import { AccountCoding } from '@prisma/client';
import { POST as _reviewPublicCloudBilling } from '@/app/api/public-cloud/products/[licencePlate]/billings/[billingId]/review/route';
import { POST as _signPublicCloudBilling } from '@/app/api/public-cloud/products/[licencePlate]/billings/[billingId]/sign/route';
import { GET as _listPublicCloudProductRequests } from '@/app/api/public-cloud/products/[licencePlate]/requests/route';
import {
  GET as _getPublicCloudProject,
  PUT as _editPublicCloudProject,
  DELETE as _deletePublicCloudProject,
} from '@/app/api/public-cloud/products/[licencePlate]/route';
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
  data.projectOwnerId = data.projectOwner?.id ?? null;
  data.primaryTechnicalLeadId = data.primaryTechnicalLead?.id ?? null;
  data.secondaryTechnicalLeadId = data.secondaryTechnicalLead?.id ?? null;
  data.expenseAuthorityId = data.expenseAuthority?.id ?? null;

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

type EmptyDocument = { id: string };

export async function editPublicCloudProject(
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
