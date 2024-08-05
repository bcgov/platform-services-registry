import axios from 'axios';
import { PrivateCloudAdminUpdateBody } from '@/schema';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/admin`,
});

export async function updatePrivateCloudProductAdmin(licencePlate: string, data: PrivateCloudAdminUpdateBody) {
  const result = await instance.put(`/private-cloud/products/${licencePlate}`, data).then((res) => res.data);
  return result;
}
