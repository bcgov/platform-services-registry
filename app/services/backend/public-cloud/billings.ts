import axios from 'axios';
import { billingSorts } from '@/constants/billing';
import { Prisma } from '@/prisma/client';
import { PublicCloudBillingSearch } from '@/types/public-cloud';
import { downloadFile } from '@/utils/browser';
import { PublicCloudBillingSearchBody } from '@/validation-schemas';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/billings`,
});

function prepareSearchPayload(data: PublicCloudBillingSearchBody) {
  const reqData = { ...data };
  const selectedOption = billingSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  } else {
    reqData.sortKey = '';
    reqData.sortOrder = Prisma.SortOrder.desc;
  }

  return reqData;
}

export async function searchPublicCloudBillings(data: PublicCloudBillingSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post<PublicCloudBillingSearch>(`/search`, reqData).then((res) => res.data);

  return result;
}

export async function downloadPublicCloudBillingPDF(billingId: string, filename = 'download.pdf') {
  const result = await instance.get(`/${billingId}/download`, { responseType: 'blob' }).then((res) => {
    if (res.status === 200) {
      downloadFile(res.data, filename, res.headers);
      return true;
    }

    return false;
  });

  return result;
}

export async function downloadPublicCloudBillings(data: PublicCloudBillingSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/download-csv', reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'billings.csv');
    return true;
  });

  return result;
}
