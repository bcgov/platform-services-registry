import { instance } from './axios';
import { PrivateCloudRequestGetPayload } from '@/app/api/private-cloud/requests/[id]/route';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/products/[licencePlate]/route';
import { PrivateCloudProductRequestsGetPayload } from '@/app/api/private-cloud/products/[licencePlate]/requests/route';
import { PrivateCloudProductSearchPayload } from '@/queries/private-cloud-products';
import { PrivateCloudRequestSearchPayload } from '@/queries/private-cloud-requests';
import { PrivateCloudRequest, PrivateCloudComment } from '@prisma/client';
import { downloadFile } from '@/utils/file-download';

export async function getPrivateCloudComment(licencePlate: string, commentId: string): Promise<PrivateCloudComment> {
  const response = await instance.get(`private-cloud/products/${licencePlate}/comments/${commentId}`);
  return response.data;
}

export async function getAllPrivateCloudComments(licencePlate: string) {
  const response = await instance.get(`private-cloud/products/${licencePlate}/comments`);
  return response.data;
}

export async function createPrivateCloudComment(
  licencePlate: string,
  text: string,
  projectId: string,
  userId: string,
): Promise<PrivateCloudComment> {
  const data = { text, projectId, userId };
  const response = await instance.post(`private-cloud/products/${licencePlate}/comments`, data);
  return response.data;
}

export async function updatePrivateCloudComment(
  licencePlate: string,
  commentId: string,
  text: string,
): Promise<PrivateCloudComment> {
  const data = { text };
  const response = await instance.put(`private-cloud/products/${licencePlate}/comments/${commentId}`, data);
  return response.data;
}

export async function deletePrivateCloudComment(
  licencePlate: string,
  commentId: string,
): Promise<{ success: boolean }> {
  const response = await instance.delete(`private-cloud/products/${licencePlate}/comments/${commentId}`);
  return response.data;
}

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
  const result = await instance.post(`private-cloud/products/search`, data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudProductSearchPayload;
}

export async function downloadPriviateCloudProducts(data: PrivateCloudProductAllCriteria) {
  const result = await instance.post(`private-cloud/products/download`, data, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'private-cloud-products.csv');
    return true;
  });

  return result;
}

export async function getPriviateCloudProject(licencePlate: string) {
  const result = await instance.get(`private-cloud/products/${licencePlate}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudProjectGetPayload;
}

export async function editPriviateCloudProject(licencePlate: string, data: any) {
  const result = await instance.post(`private-cloud/edit/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function createPriviateCloudProject(data: any) {
  const result = await instance.post(`private-cloud/create/`, data).then((res) => res.data);
  return result;
}

export async function getPriviateCloudRequest(id: string) {
  const result = await instance.get(`private-cloud/requests/${id}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.requestedProject.secondaryTechnicalLead === null) {
      delete res.data.requestedProject.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudRequestGetPayload;
}

export async function getPriviateCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance
    .get(`private-cloud/products/${licencePlate}/requests?active=${active}`)
    .then((res) => res.data);
  return result as PrivateCloudProductRequestsGetPayload[];
}

export async function deletePrivateCloudProject(licencePlate: string) {
  const result = await instance.post(`private-cloud/delete/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function makePriviateCloudRequestedDecision(licencePlate: string, data: any) {
  const result = await instance.post(`private-cloud/decision/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function reprovisionPriviateCloudRequest(licencePlate: string) {
  const result = await instance.get(`private-cloud/products/${licencePlate}/reprovision`).then((res) => res.data);
  return result;
}

export async function resendPriviateCloudRequest(licencePlate: string) {
  const result = await instance.get(`private-cloud/products/${licencePlate}/resend`).then((res) => res.data);
  return result;
}

export async function searchPriviateCloudRequests(data: PrivateCloudProductSearchCriteria) {
  const result = await instance.post(`private-cloud/requests/search`, data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudRequestSearchPayload;
}
