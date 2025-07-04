import axios from 'axios';
import { publicCloudProductSorts } from '@/constants';
import { AccountCoding, Prisma } from '@/prisma/client';
import {
  PublicCloudRequestSimpleDecorated,
  PublicCloudProductSearch,
  PublicCloudRequestDetail,
  PublicCloudBillingSimpleDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudBillingDetailDecorated,
} from '@/types/public-cloud';
import { downloadFile } from '@/utils/browser';
import {
  PublicCloudBillingBody,
  PublicCloudProductSearchBody,
  PublicCloudProductSearchNoPaginationBody,
} from '@/validation-schemas/public-cloud';
import { Comment } from '@/validation-schemas/shared';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

function prepareSearchPayload(data: PublicCloudProductSearchBody) {
  const reqData = { ...data };
  const selectedOption = publicCloudProductSorts.find((sort) => sort.label === reqData.sortValue);

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
  const result = await instance.post<PublicCloudProductSearch>(`/search`, reqData).then((res) => {
    return res.data;
  });

  return result;
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

export async function getPublicCloudProduct(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}`).then((res) => {
    // Secondaty technical lead should only be included if it exists
    if (res.data.secondaryTechnicalLead === null) {
      delete res.data.secondaryTechnicalLead;
    }

    return res.data;
  });

  return result as PublicCloudProductDetailDecorated;
}

export async function createPublicCloudProduct(data: any) {
  const result = await instance.post<PublicCloudRequestDetail>('/', data).then((res) => res.data);
  return result;
}

export async function editPublicCloudProduct(licencePlate: string, data: any) {
  const result = await instance.put<PublicCloudRequestDetail>(`/${licencePlate}`, data).then((res) => res.data);
  return result;
}

export async function deletePublicCloudProduct(licencePlate: string, requestComment: Comment) {
  const result = await instance
    .post<PublicCloudRequestDetail>(`/${licencePlate}/archive`, { requestComment })
    .then((res) => res.data);
  return result;
}

export async function getPublicCloudProductRequests(licencePlate: string, active = false) {
  const result = await instance
    .get<PublicCloudRequestSimpleDecorated[]>(`/${licencePlate}/requests?active=${active}`)
    .then((res) => res.data);

  return result;
}

export async function getPublicCloudProductMembersHistory(licencePlate: string) {
  const result = await instance.get(`/${licencePlate}/members-history}`).then((res) => res.data);

  return result;
}

export async function getPublicCloudProductBillings(licencePlate: string) {
  const result = await instance
    .get<PublicCloudBillingSimpleDecorated[]>(`/${licencePlate}/billings`)
    .then((res) => res.data);
  return result;
}

export async function getPublicCloudProductBilling(licencePlate: string, billingId: string) {
  const result = await instance
    .get<PublicCloudBillingDetailDecorated>(`/${licencePlate}/billings/${billingId}`)
    .then((res) => res.data);
  return result;
}

export async function signPublicCloudProductBilling(
  licencePlate: string,
  data: { billingId: string; accountCoding: AccountCoding; confirmed: boolean },
) {
  const result = await instance
    .post<true>(`/${licencePlate}/billings/${data.billingId}/sign`, data)
    .then((res) => res.data);
  return result;
}

export async function reviewPublicCloudProductBilling(
  licencePlate: string,
  data: { billingId: string; decision: string },
) {
  const result = await instance
    .post<true>(`/${licencePlate}/billings/${data.billingId}/review`, data)
    .then((res) => res.data);
  return result;
}

export async function updateAccountCoding(licencePlate: string, data: PublicCloudBillingBody) {
  const result = await instance.put<true>(`/${licencePlate}/billings`, data).then((res) => res.data);
  return result;
}
