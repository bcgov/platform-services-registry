import axios from 'axios';
import { BillingGetPayload } from '@/types/billing';
import { downloadFile } from '@/utils/browser';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/billing`,
});

export async function getBilling(accountCoding: string, context: string) {
  const result = await instance.get(`/${accountCoding}?context=${context}`).then((res) => res.data);
  return result as BillingGetPayload;
}

export async function existBilling(accountCoding: string, context: string) {
  const result = await instance.get(`/${accountCoding}/exist?context=${context}`).then((res) => res.data);
  return result as boolean;
}

export async function downloadBilling(
  accountCoding: string,
  context: string,
  licencePlate = '',
  filename = 'download.pdf',
) {
  let url = `/${accountCoding}/download?context=${context}`;
  if (licencePlate) url += `&licencePlate=${licencePlate}`;

  const result = await instance.get(url, { responseType: 'blob' }).then((res) => {
    if (res.status === 200) {
      downloadFile(res.data, filename, res.headers);
      return true;
    }

    return false;
  });

  return result;
}
