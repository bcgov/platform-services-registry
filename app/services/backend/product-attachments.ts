import axios from 'axios';
import { ProductAttachmentSummary } from '@/types/system';
import { instance as baseInstance } from './axios';

export async function getPrivateCloudProductAttachments(licencePlate: string) {
  return axios
    .create({ ...baseInstance.defaults, baseURL: `${baseInstance.defaults.baseURL}/private-cloud/products` })
    .get<ProductAttachmentSummary>(`/${licencePlate}/attachments`)
    .then((res) => res.data);
}

export async function getPublicCloudProductAttachments(licencePlate: string) {
  return axios
    .create({ ...baseInstance.defaults, baseURL: `${baseInstance.defaults.baseURL}/public-cloud/products` })
    .get<ProductAttachmentSummary>(`/${licencePlate}/attachments`)
    .then((res) => res.data);
}
