import axios from 'axios';
import { PublicCloudRequestGetPayload, PublicCloudRequestSearchPayload } from '@/queries/public-cloud-requests';
import { instance as parentInstance } from './instance';
import { PublicCloudProductSearchCriteria } from './products';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/requests`,
});

export async function getPublicCloudRequest(id: string) {
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

  return result as PublicCloudRequestGetPayload;
}

export async function searchPublicCloudRequests(data: PublicCloudProductSearchCriteria) {
  const result = await instance.post('/search', data).then((res) => {
    return res.data;
  });

  return result as PublicCloudRequestSearchPayload;
}

export async function makePublicCloudRequestDecision(id: string, data: any) {
  const result = await instance.post(`/${id}/decision`, data).then((res) => res.data);
  return result;
}

export async function signPublicCloudMou(id: string, data: { taskId: string; confirmed: boolean }) {
  const result = await instance.post(`/${id}/sign-mou`, data).then((res) => res.data);
  return result;
}

export async function reviewPublicCloudMou(id: string, data: { taskId: string; decision: string }) {
  const result = await instance.post(`/${id}/review-mou`, data).then((res) => res.data);
  return result;
}
