import axios from 'axios';
import { instance as parentInstance } from './instance';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/products/_operations/read';
import { PrivateCloudProductRequestsGetPayload } from '@/app/api/private-cloud/products/[licencePlate]/requests/route';
import { PrivateCloudProductSearchPayload } from '@/queries/private-cloud-products';
import { PrivateCloudComment } from '@prisma/client';
import { downloadFile } from '@/utils/file-download';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

export interface PrivateCloudProductAllCriteria {
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  cluster: string;
  includeInactive: boolean;
  sortKey: string;
  sortOrder: string;
}

export interface PrivateCloudProductSearchCriteria extends PrivateCloudProductAllCriteria {
  page: number;
  pageSize: number;
}

export async function searchPriviateCloudProducts(data: PrivateCloudProductSearchCriteria) {
  const result = await instance.post('/search', data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudProductSearchPayload;
}

export async function downloadPriviateCloudProducts(data: PrivateCloudProductAllCriteria) {
  const result = await instance.post('/download', data, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'private-cloud-products.csv');
    return true;
  });

  return result;
}

export async function getPriviateCloudProject(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudProjectGetPayload;
}

export async function createPriviateCloudProject(data: any) {
  const result = await instance.post('/', data).then((res) => res.data);
  return result;
}

export async function editPriviateCloudProject(licencePlate: string, data: any) {
  const result = await instance.put(`/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await instance.delete(`/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function makePriviateCloudRequestDecision(licencePlate: string, data: any) {
  const result = await instance.post(`/${licencePlate}/decision`, data).then((res) => res.data);
  return result;
}

export async function checkPriviateCloudProductDeletionAvailability(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/deletion-check`).then((res) => res.data);
  return result;
}

export async function reprovisionPriviateCloudRequest(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/reprovision`).then((res) => res.data);
  return result;
}

export async function resendPriviateCloudRequest(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/resend`).then((res) => res.data);
  return result;
}

export async function getPriviateCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance.get(`/${licencePlate}/requests?active=${active}`).then((res) => res.data);
  return result as PrivateCloudProductRequestsGetPayload[];
}

export async function getPrivateCloudComment(licencePlate: string, commentId: string) {
  const response = await instance.get(`/${licencePlate}/comments/${commentId}`);
  return response.data as PrivateCloudComment;
}

export async function getAllPrivateCloudComments(licencePlate: string) {
  const response = await instance.get(`/${licencePlate}/comments`);
  return response.data;
}

export async function createPrivateCloudComment(licencePlate: string, text: string, projectId: string, userId: string) {
  const data = { text, projectId, userId };
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
