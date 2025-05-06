import axios from 'axios';
import { PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { downloadFile } from '@/utils/browser';
import { PrivateCloudAdminUpdateBody } from '@/validation-schemas/private-cloud';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/admin`,
});

export async function updatePrivateCloudProductAdmin(licencePlate: string, data: PrivateCloudAdminUpdateBody) {
  const result = await instance
    .put<PrivateCloudProductDetailDecorated>(`/private-cloud/products/${licencePlate}`, data)
    .then((res) => res.data);
  return result;
}

export async function getAdminMonthlyCosts(yearMonth: string, page = 1, pageSize = 10) {
  const response = await instance
    .get(`/private-cloud/costs/monthly/${yearMonth}`, {
      params: { page, pageSize },
    })
    .then((res) => res.data);
  return response;
}
