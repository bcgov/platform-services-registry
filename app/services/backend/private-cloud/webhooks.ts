import axios from 'axios';
import { PrivateCloudProductWebhookDetailDecorated } from '@/types/private-cloud';
import { PrivateCloudProductWebhookBody } from '@/validation-schemas/private-cloud';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/webhooks`,
});

export async function getPrivateCloudProductWebhook(licencePlate: string) {
  const result = await instance
    .get<PrivateCloudProductWebhookDetailDecorated>(`/${licencePlate}`)
    .then((res) => res.data);
  return result;
}

export async function upsertPrivateCloudProductWebhook(licencePlate: string, data: PrivateCloudProductWebhookBody) {
  const result = await instance.put<PrivateCloudProductWebhookBody>(`/${licencePlate}`, data).then((res) => res.data);
  return result;
}
