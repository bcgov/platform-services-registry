import axios from 'axios';
import { PrivateCloudRequestGetPayload } from '@/app/api/private-cloud/requests/[id]/route';
import { PrivateCloudRequestSearchPayload } from '@/queries/private-cloud-requests';
import { instance as parentInstance } from './instance';
import { PrivateCloudProductSearchCriteria } from './products';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/requests`,
});

export async function getPriviateCloudRequest(id: string) {
  const result = await instance.get(`/${id}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.decisionData.secondaryTechnicalLead === null) {
      delete res.data.decisionData.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudRequestGetPayload;
}

export async function searchPriviateCloudRequests(data: PrivateCloudProductSearchCriteria) {
  const result = await instance.post('/search', data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudRequestSearchPayload;
}

export async function makePriviateCloudRequestDecision(id: string, data: any) {
  const result = await instance.post(`/${id}/decision`, data).then((res) => res.data);
  return result;
}

export async function resendPriviateCloudRequest(id: string) {
  const result = await instance.get(`/${id}/resend`).then((res) => res.data);
  return result;
}
