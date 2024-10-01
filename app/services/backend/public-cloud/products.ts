import { Prisma } from '@prisma/client';
import axios from 'axios';
import { productSorts } from '@/constants';
import {
  PublicCloudRequestSimpleDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudProductSearch,
  PublicCloudRequestDetail,
} from '@/types/public-cloud';
import { downloadFile } from '@/utils/file-download';
import {
  PublicCloudProductSearchBody,
  PublicCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/public-cloud';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

function prepareSearchPayload(data: PublicCloudProductSearchBody) {
  const reqData = { ...data };
  const selectedOption = productSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  } else {
    reqData.sortKey = '';
    reqData.sortOrder = Prisma.SortOrder.desc;
  }

  return reqData;
}

export async function searchPublicCloudProducts(data: PublicCloudProductSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post(`/search`, reqData).then((res) => {
    return res.data;
  });

  return result as PublicCloudProductSearch;
}

export async function downloadPublicCloudProducts(data: PublicCloudProductSearchNoPaginationBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post(`/download`, reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'public-cloud-products.csv');
    return true;
  });

  return result;
}

export async function getPublicCloudProject(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}`).then((res) => {
    // Secondaty technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PublicCloudProductDetailDecorated;
}

export async function createPublicCloudProject(data: any) {
  const result = await instance.post('/', data).then((res) => res.data);
  return result as PublicCloudRequestDetail;
}

export async function editPublicCloudProject(licencePlate: string, data: any) {
  const result = await instance.put(`/${licencePlate}`, data).then((res) => res.data);
  return result as PublicCloudRequestDetail;
}

export async function deletePublicCloudProject(licencePlate: string) {
  const result = await instance.delete(`/${licencePlate}`).then((res) => res.data);
  return result as PublicCloudRequestDetail;
}

export async function getPublicCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance.get(`/${licencePlate}/requests?active=${active}`).then((res) => res.data);

  return result as PublicCloudRequestSimpleDecorated[];
}

export async function signPublicCloudMou(licencePlate: string, data: { taskId: string; confirmed: boolean }) {
  const result = await instance.post(`/${licencePlate}/sign-mou`, data).then((res) => res.data);
  return result as true;
}

export async function reviewPublicCloudMou(licencePlate: string, data: { taskId: string; decision: string }) {
  const result = await instance.post(`/${licencePlate}/review-mou`, data).then((res) => res.data);
  return result as true;
}
