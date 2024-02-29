import { instance } from './axios';

export async function getPriviateCloudRequestedProject(licencePlate: string) {
  const result = await instance.get(`private-cloud/active-request/${licencePlate}`).then((res) => res.data);
  return result;
}
