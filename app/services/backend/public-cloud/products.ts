import axios from 'axios';
import {
  PublicCloudRequestSimpleDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudProductSearch,
  PublicCloudRequestDetail,
} from '@/types/public-cloud';
import { downloadFile } from '@/utils/file-download';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

export interface PublicCloudProductAllCriteria {
  search: string;
  page: number;
  pageSize: number;
  licencePlate: string;
  ministry: string;
  provider: string;
  includeInactive: boolean;
  sortKey: string;
  sortOrder: string;
}

export interface PublicCloudProductSearchCriteria extends PublicCloudProductAllCriteria {
  page: number;
  pageSize: number;
}

export async function searchPublicCloudProducts(data: PublicCloudProductSearchCriteria) {
  const result = await instance.post(`/search`, data).then((res) => {
    return res.data;
  });

  return result as PublicCloudProductSearch;
}

export async function downloadPublicCloudProducts(data: PublicCloudProductSearchCriteria) {
  const result = await instance.post(`/download`, data, { responseType: 'blob' }).then((res) => {
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
