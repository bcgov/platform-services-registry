import { PrivateCloudComment } from '@prisma/client';
import axios from 'axios';
import { PrivateCloudProductRequestsGetPayload } from '@/app/api/private-cloud/products/[licencePlate]/requests/route';
import { PrivateCloudProjectGetPayload, PrivateCloudProductSearchPayload } from '@/queries/private-cloud-products';
import { downloadFile } from '@/utils/file-download';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

export interface PrivateCloudProductAllCriteria {
  search: string;
  page: number;
  pageSize: number;
  licencePlate: string;
  ministry: string;
  cluster: string;
  includeInactive: boolean;
  sortKey: string;
  sortOrder: string;
  showTest: boolean;
}

export interface PrivateCloudProductSearchCriteria extends PrivateCloudProductAllCriteria {
  page: number;
  pageSize: number;
}

export async function searchPrivateCloudProducts(data: PrivateCloudProductSearchCriteria) {
  const result = await instance.post('/search', data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudProductSearchPayload;
}

export async function downloadPrivateCloudProducts(data: PrivateCloudProductAllCriteria) {
  const result = await instance.post('/download', data, { responseType: 'blob' }).then((res) => {
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

  return result as PrivateCloudProjectGetPayload;
}

export async function createPrivateCloudProject(data: any) {
  const result = await instance.post('/', data).then((res) => res.data);
  return result;
}

export async function editPrivateCloudProject(licencePlate: string, data: any) {
  const result = await instance.put(`/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await instance.delete(`/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function checkPrivateCloudProductDeletionAvailability(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/deletion-check`).then((res) => res.data);
  return result;
}

export async function reprovisionPrivateCloudProduct(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/reprovision`).then((res) => res.data);
  return result;
}

export async function getPrivateCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance.get(`/${licencePlate}/requests?active=${active}`).then((res) => res.data);
  return result as PrivateCloudProductRequestsGetPayload[];
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
