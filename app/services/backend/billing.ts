import { Provider } from '@prisma/client';
import axios from 'axios';
import { billingSorts } from '@/constants/billing';
import { BillingGetPayload, BillingSearchResponsePayload } from '@/types/billing';
import { downloadFile } from '@/utils/browser';
import { BillingSearchBody } from '@/validation-schemas/billing';
import { instance as baseInstance } from './axios';

function prepareSearchPayload(data: BillingSearchBody) {
  const reqData = { ...data };

  const selectedOption = billingSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  }
  return reqData;
}

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
  if (context === Provider.AWS_LZA) context = Provider.AWS;

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

export async function searchBilling(data: BillingSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post<BillingSearchResponsePayload>('search', reqData);
  return result.data;
}

export async function downloadBillings(data: BillingSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/download', reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'billings.csv');
    return true;
  });

  return result;
}
