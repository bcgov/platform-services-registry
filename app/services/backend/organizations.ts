import axios from 'axios';
import { Organization } from '@/prisma/client';
import { OrganizationBody } from '@/validation-schemas/organization';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/organizations`,
});

export async function listOrganizations() {
  const result = await instance.get<Organization[]>('/').then((res) => res.data);

  return result;
}

export async function createOrganization(data: OrganizationBody) {
  const result = await instance.post<Organization>('/', data).then((res) => res.data);

  return result;
}

export async function getOrganization(id: string) {
  const result = await instance.get<Organization>(`/${id}`).then((res) => res.data);

  return result;
}

export async function updateOrganization(id: string, data: OrganizationBody) {
  const result = await instance.put<Organization[]>(`/${id}`, data).then((res) => res.data);

  return result;
}

export async function deleteOrganization(id: string) {
  const result = await instance.delete<Organization>(`/${id}`).then((res) => res.data);

  return result;
}
