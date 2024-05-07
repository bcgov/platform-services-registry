import axios from 'axios';
import { instance as parentInstance } from './instance';
import { PublicCloudRequestGetPayload } from '@/app/api/public-cloud/requests/[id]/route';
import { PublicCloudRequestSearchPayload } from '@/queries/public-cloud-requests';
import { PublicCloudProductSearchCriteria } from './products';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/requests`,
});

export async function getPublicCloudRequest(id: string) {
  const result = await instance.get(`/${id}`).then((res) => {
    // Secondary technical lead should only be included if it exists
    if (res.data.decisionData.secondaryTechnicalLead === null) {
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
