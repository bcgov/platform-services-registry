import { instance } from './axios';
import { PrivateCloudActiveRequestGetPayload } from '@/app/api/private-cloud/active-request/[licencePlate]/route';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/project/[licencePlate]/route';
import { PrivateCloudRequest, PrivateCloudComment } from '@prisma/client';

export async function getPrivateCloudComment(licencePlate: string, commentId: string): Promise<PrivateCloudComment> {
  const response = await instance.get(`private-cloud/products/${licencePlate}/comments/${commentId}`);
  return response.data;
}

export async function getAllPrivateCloudComments(licencePlate: string) {
  const response = await instance.get(`private-cloud/products/${licencePlate}/comments`);
  console.log(response.data, 'response data for list all comments');
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

export async function getPriviateCloudProject(licencePlate: string) {
  const result = await instance.get(`private-cloud/project/${licencePlate}`).then((res) => {
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

export async function getPriviateCloudActiveRequest(licencePlate: string) {
  const result = await instance.get(`private-cloud/active-request/${licencePlate}`).then((res) => res.data);
  return result as PrivateCloudActiveRequestGetPayload;
}

export async function getPriviateCloudRequest(licencePlate: string) {
  const result = await instance.get(`private-cloud/request/${licencePlate}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.requestedProject.secondaryTechnicalLead === null) {
      delete res.data.requestedProject.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result;
}

export async function getPriviateCloudRequestsHistory(licencePlate: string): Promise<PrivateCloudRequest[]> {
  const result = await instance.get(`private-cloud/products/${licencePlate}/history`).then((res) => res.data);
  return result;
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
