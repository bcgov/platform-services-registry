import axios from 'axios';
import { privateCloudProductSorts } from '@/constants';
import { Prisma, PrivateCloudComment, QuotaUpgradeResourceDetail, ResourceRequestsEnv } from '@/prisma/client';
import { MembersHistoryResponse } from '@/services/db/members-history';
import { DeletionCheck } from '@/services/k8s/reads';
import {
  PrivateCloudRequestSimpleDecorated,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSearch,
  PrivateCloudRequestDetail,
  QuarterlyCost,
  PrivateCloudRequestDetailDecorated,
  YearlyCost,
} from '@/types/private-cloud';
import { MonthlyCost } from '@/types/private-cloud';
import { UsageMetrics } from '@/types/usage';
import { downloadFile } from '@/utils/browser';
import {
  PrivateCloudProductSearchBody,
  PrivateCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/private-cloud';
import { Comment } from '@/validation-schemas/shared';
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
  const result = await instance.post<PrivateCloudProductSearch>('/search', reqData).then((res) => {
    return res.data;
  });

  return result;
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

export async function getPrivateCloudProduct(licencePlate: string) {
  const result = await instance.get<PrivateCloudProductDetailDecorated>(`/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function createPrivateCloudProduct(data: any) {
  const result = await instance.post<PrivateCloudRequestDetailDecorated>('', data).then((res) => res.data);
  return result;
}

export async function editPrivateCloudProduct(licencePlate: string, data: any) {
  const result = await instance
    .put<PrivateCloudRequestDetailDecorated>(`/${licencePlate}`, data)
    .then((res) => res.data);
  return result;
}

export async function deletePrivateCloudProduct(licencePlate: string, requestComment: Comment) {
  const result = await instance.post(`/${licencePlate}/archive`, { requestComment }).then((res) => res.data);
  return result;
}

export async function checkPrivateCloudProductDeletionAvailability(licencePlate: string) {
  const result = await instance.get<DeletionCheck>(`/${licencePlate}/deletion-check`).then((res) => res.data);
  return result;
}

export async function reprovisionPrivateCloudProduct(licencePlate: string) {
  const result = await instance.get<true>(`/${licencePlate}/reprovision`).then((res) => res.data);
  return result;
}

export async function getPrivateCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance
    .get<PrivateCloudRequestSimpleDecorated[]>(`/${licencePlate}/requests?active=${active}`)
    .then((res) => res.data);
  return result;
}

export async function getPrivateCloudProductMembersHistory(licencePlate: string) {
  const result = await instance.get<MembersHistoryResponse>(`/${licencePlate}/members-history`).then((res) => res.data);
  return result;
}

export async function getPrivateCloudComment(licencePlate: string, commentId: string) {
  const response = await instance.get<PrivateCloudComment>(`/${licencePlate}/comments/${commentId}`);
  return response.data;
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
  const response = await instance.post<PrivateCloudComment>(`/${licencePlate}/comments`, data);
  return response.data;
}

export async function updatePrivateCloudComment(licencePlate: string, commentId: string, text: string) {
  const data = { text };
  const response = await instance.put<PrivateCloudComment>(`/${licencePlate}/comments/${commentId}`, data);
  return response.data;
}

export async function deletePrivateCloudComment(licencePlate: string, commentId: string) {
  const response = await instance.delete<{ success: boolean }>(`/${licencePlate}/comments/${commentId}`);
  return response.data;
}

export async function getPrivateCloudCommentCount(licencePlate: string, requestId?: string) {
  const url = `/${licencePlate}/count${requestId ? `?requestId=${requestId}` : ''}`;
  const response = await instance.get<{ count: number }>(url);
  return response.data;
}

export async function getUsageMetrics(licencePlate: string, cluster: string, environment: string) {
  const response = await instance.get<UsageMetrics>(
    `/${licencePlate}/usage-metrics?environment=${environment}&cluster=${cluster}`,
  );

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

export async function getQuotaChangeStatus(licencePlate: string, resourceRequests: ResourceRequestsEnv) {
  const response = await instance.post<QuotaChangeStatus>(`/${licencePlate}/quota-change-status`, { resourceRequests });
  return response.data;
}

export async function getYearlyCosts(licencePlate: string, year: string) {
  const response = await instance.get<YearlyCost>(`/${licencePlate}/costs/yearly/${year}`).then((res) => res.data);
  return response;
}

export async function downloadPrivateCloudYearlyCosts(licencePlate: string, year: string) {
  const result = await instance
    .post(`/${licencePlate}/costs/yearly/${year}/download`, {}, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;
      downloadFile(res.data, `yearly-costs-${year}.pdf`);
      return true;
    });

  return result;
}

export async function getMonthlyCosts(licencePlate: string, yearMonth: string) {
  const response = await instance
    .get<MonthlyCost>(`/${licencePlate}/costs/monthly/${yearMonth}`)
    .then((res) => res.data);
  return response;
}

export async function downloadPrivateCloudMonthlyCosts(licencePlate: string, yearMonth: string) {
  const result = await instance
    .post(`/${licencePlate}/costs/monthly/${yearMonth}/download`, {}, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;
      downloadFile(res.data, `monthly-costs-${yearMonth}.pdf`);
      return true;
    });

  return result;
}

export async function getQuarterlyCosts(licencePlate: string, yearMonth: string) {
  const response = await instance
    .get<QuarterlyCost>(`/${licencePlate}/costs/quarterly/${yearMonth}`)
    .then((res) => res.data);
  return response;
}

export async function downloadPrivateCloudQuarterlyCosts(licencePlate: string, yearQuarter: string) {
  const result = await instance
    .post(`/${licencePlate}/costs/quarterly/${yearQuarter}/download`, {}, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      const [year, quarter] = yearQuarter.split('-').map(Number);
      downloadFile(res.data, `quarterly-costs-${year}-Q${quarter}.pdf`);
      return true;
    });

  return result;
}
