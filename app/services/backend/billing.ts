import axios from 'axios';
import { BillingGetPayload } from '@/types/billing';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/billing`,
});

export async function getBilling(accountCoding: string) {
  const result = await instance.get(`/${accountCoding}`).then((res) => res.data);
  return result as BillingGetPayload;
}

export async function existBilling(accountCoding: string) {
  const result = await instance.get(`/${accountCoding}/exist`).then((res) => res.data);
  return result as boolean;
}
