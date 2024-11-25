import { Prisma, PrivateCloudComment, QuotaUpgradeResourceDetail } from '@prisma/client';
import axios from 'axios';
import { privateCloudProductSorts } from '@/constants';
import {
  PrivateCloudRequestSimpleDecorated,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSearch,
  PrivateCloudRequestDetail,
} from '@/types/private-cloud';
import { downloadFile } from '@/utils/file-download';
import {
  PrivateCloudProductSearchBody,
  PrivateCloudProductSearchNoPaginationBody,
  Quotas,
} from '@/validation-schemas/private-cloud';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

function prepareSearchPayload(data: PrivateCloudProductSearchBody) {
  const reqData = { ...data };
  const selectedOption = privateCloudProductSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  } else {
    reqData.sortKey = '';
    reqData.sortOrder = Prisma.SortOrder.desc;
  }

  return reqData;
}

export async function searchPrivateCloudProducts(data: PrivateCloudProductSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/search', reqData).then((res) => {
    return res.data;
  });

  return result as PrivateCloudProductSearch;
}

export async function downloadPrivateCloudProducts(data: PrivateCloudProductSearchNoPaginationBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/download', reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'private-cloud-products.csv');
    return true;
  });

  return result;
}

export async function getPrivateCloudProject(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudProductDetailDecorated;
}

export async function createPrivateCloudProject(data: any) {
  const result = await instance.post('', data).then((res) => res.data);
  return result as PrivateCloudRequestDetail;
}

export async function editPrivateCloudProject(licencePlate: string, data: any) {
  const result = await instance.put(`/${licencePlate}`, data).then((res) => res.data);
  return result as PrivateCloudRequestDetail;
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await instance.delete(`/${licencePlate}`).then((res) => res.data);
  return result as PrivateCloudRequestDetail;
}

export async function checkPrivateCloudProductDeletionAvailability(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/deletion-check`).then((res) => res.data);
  return result as string;
}

export async function reprovisionPrivateCloudProduct(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/reprovision`).then((res) => res.data);
  return result as true;
}

export async function getPrivateCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance.get(`/${licencePlate}/requests?active=${active}`).then((res) => res.data);
  return result as PrivateCloudRequestSimpleDecorated[];
}

export async function getPrivateCloudComment(licencePlate: string, commentId: string) {
  const response = await instance.get(`/${licencePlate}/comments/${commentId}`);
  return response.data as PrivateCloudComment;
}

export async function getAllPrivateCloudComments(licencePlate: string, requestId?: string) {
  let url = `/${licencePlate}/comments`;
  if (requestId) {
    url += `?requestId=${requestId}`;
  }
  const response = await instance.get(url);
  return response.data;
}

export async function createPrivateCloudComment(
  licencePlate: string,
  text: string,
  userId: string,
  projectId?: string,
  requestId?: string,
) {
  const data = { text, userId, projectId, requestId };
  const response = await instance.post(`/${licencePlate}/comments`, data);
  return response.data as PrivateCloudComment;
}

export async function updatePrivateCloudComment(licencePlate: string, commentId: string, text: string) {
  const data = { text };
  const response = await instance.put(`/${licencePlate}/comments/${commentId}`, data);
  return response.data as PrivateCloudComment;
}

export async function deletePrivateCloudComment(licencePlate: string, commentId: string) {
  const response = await instance.delete(`/${licencePlate}/comments/${commentId}`);
  return response.data as { success: boolean };
}

export async function getPrivateCloudCommentCount(licencePlate: string, requestId?: string) {
  const url = `/${licencePlate}/count${requestId ? `?requestId=${requestId}` : ''}`;
  const response = await instance.get(url);
  return response.data;
}

export async function getPodUsageMetrics(licencePlate: string, environment: string, cluster: string) {
  const response = await instance.get(`/${licencePlate}/usage-metrics?environment=${environment}&cluster=${cluster}`);
  return response.data;
}

export async function getSubnetForEmerald(licencePlate: string, environment: string) {
  const response = await instance.get<string>(`/${licencePlate}/namespace-subnet?environment=${environment}`);
  return response.data;
}

export interface QuotaChangeStatus {
  hasChange: boolean;
  hasIncrease: boolean;
  hasSignificantIncrease: boolean;
  isEligibleForAutoApproval: boolean;
  resourceCheckRequired: boolean;
  resourceDetailList: QuotaUpgradeResourceDetail;
}

export async function getQuotaChangeStatus(licencePlate: string, requestedQuota: Quotas) {
  const response = await instance.post<QuotaChangeStatus>(`/${licencePlate}/quota-change-status`, { requestedQuota });
  return response.data;
}
