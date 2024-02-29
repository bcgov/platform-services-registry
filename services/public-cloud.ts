import { instance } from './axios';

export async function getPublicCloudRequestedProject(licencePlate: string) {
  const result = await instance.get(`public-cloud/active-request/${licencePlate}`).then((res) => res.data);
  return result;
}
