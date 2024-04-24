import { instance } from './axios';
import { PublicCloudActiveRequestGetPayload } from '@/app/api/public-cloud/active-request/[licencePlate]/route';
import { PublicCloudProjectGetPayload } from '@/app/api/public-cloud/project/[licencePlate]/route';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from '@/types/doc-decorate';
import { PublicCloudRequest } from '@prisma/client';

export async function getPublicCloudProject(licencePlate: string) {
  const result = await instance.get(`public-cloud/project/${licencePlate}`).then((res) => {
    // Secondaty technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PublicCloudProjectGetPayload & PublicCloudProjectDecorate;
}
export async function editPublicCloudProject(licencePlate: string, data: any) {
  const result = await instance.post(`public-cloud/edit/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function createPublicCloudProject(data: any) {
  const result = await instance.post(`public-cloud/create/`, data).then((res) => res.data);
  return result;
}

export async function getPublicCloudActiveRequest(licencePlate: string) {
  const result = await instance.get(`public-cloud/active-request/${licencePlate}`).then((res) => res.data);
  return result as PublicCloudActiveRequestGetPayload & PublicCloudRequestDecorate;
}

export async function getPublicCloudRequestedProject(id: string) {
  const result = await instance.get(`public-cloud/requested-project/${id}`).then((res) => res.data);
  return result;
}

export async function getPublicCloudRequestsHistory(licencePlate: string): Promise<PublicCloudRequest[]> {
  const result = await instance.get(`public-cloud/history/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function deletePublicCloudProject(licencePlate: string) {
  const result = await instance.post(`public-cloud/delete/${licencePlate}`).then((res) => res.data);
  return result;
}

export async function makePublicCloudRequestedDecision(licencePlate: string, data: any) {
  const result = await instance.post(`public-cloud/decision/${licencePlate}`, data).then((res) => res.data);
  return result;
}
