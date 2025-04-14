import { PrivateCloudUnitPrice } from '@prisma/client';
import axios from 'axios';
import { YyyyMmDd } from '@/validation-schemas';
import { PrivateCloudUnitPriceBody } from '@/validation-schemas/private-cloud';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/unit-prices`,
});

export async function getPrivateCloudUnitPrices() {
  const result = await instance.get<PrivateCloudUnitPrice[]>('/').then((res) => res.data);
  return result;
}

export async function getPrivateCloudUnitPrice(date: YyyyMmDd) {
  const result = await instance.get<PrivateCloudUnitPrice>(`/${date}`).then((res) => res.data);
  return result;
}

export async function upsertPrivateCloudUnitPrice(date: YyyyMmDd, data: PrivateCloudUnitPriceBody) {
  const result = await instance.put<PrivateCloudUnitPriceBody>(`/${date}`, data).then((res) => res.data);
  return result;
}

export async function deletePrivateCloudUnitPrice(date: YyyyMmDd) {
  const result = await instance.delete<PrivateCloudUnitPriceBody>(`/${date}`).then((res) => res.data);
  return result;
}
