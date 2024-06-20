import axios from 'axios';
import { PrivateCloudRequestGetPayload, PrivateCloudRequestSearchPayload } from '@/queries/private-cloud-requests';
import { instance as parentInstance } from './instance';
import { PrivateCloudProductSearchCriteria } from './products';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/requests`,
});

export async function getPrivateCloudRequest(id: string) {
  const result = await instance.get(`/${id}`).then((res) => {
    if (res.data.originalData?.secondaryTechnicalLead === null) {
      delete res.data.originalData.secondaryTechnicalLead;
    }

    if (res.data.requestData?.secondaryTechnicalLead === null) {
      delete res.data.requestData.secondaryTechnicalLead;
    }

    if (res.data.decisionData?.secondaryTechnicalLead === null) {
      delete res.data.decisionData.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PrivateCloudRequestGetPayload;
}

export async function searchPrivateCloudRequests(data: PrivateCloudProductSearchCriteria) {
  const result = await instance.post('/search', data).then((res) => {
    return res.data;
  });

  return result as PrivateCloudRequestSearchPayload;
}

export async function makePrivateCloudRequestDecision(id: string, data: any) {
  const result = await instance.post(`/${id}/decision`, data).then((res) => res.data);
  return result;
}

export async function resendPrivateCloudRequest(id: string) {
  const result = await instance.get(`/${id}/resend`).then((res) => res.data);
  return result;
}
