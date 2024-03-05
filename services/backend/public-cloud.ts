import { instance } from './axios';

export async function getPublicCloudProject(licencePlate: string) {
  const result = await instance.get(`public-cloud/project/${licencePlate}`).then((res) => {
    // Secondaty technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result;
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
  return result;
}

export async function getPublicCloudRequest(licencePlate: string) {
  const result = await instance.get(`public-cloud/request/${licencePlate}`).then((res) => {
    // Secondaty technical lead should only be included if it exists
    if (res.data.requestedProject.secondaryTechnicalLead === null) {
      delete res.data.requestedProject.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result;
}

export async function makePublicCloudRequestedDecision(licencePlate: string, data: any) {
  const result = await instance.post(`public-cloud/decision/${licencePlate}`, data).then((res) => res.data);
  return result;
}
