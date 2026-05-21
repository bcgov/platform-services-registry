import axios from 'axios';
import { SystemDetailDecorated, SystemSimpleDecorated } from '@/types/system';
import { SystemBody } from '@/validation-schemas/system';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/systems`,
});

export async function listSystems({ includeArchived = false }: { includeArchived?: boolean } = {}) {
  return instance
    .get<SystemSimpleDecorated[]>('/', {
      params: { includeArchived },
    })
    .then((res) => res.data);
}

export async function createSystem(data: SystemBody) {
  return instance.post<SystemDetailDecorated>('/', data).then((res) => res.data);
}

export async function getSystem(id: string) {
  return instance.get<SystemDetailDecorated>(`/${id}`).then((res) => res.data);
}

export async function updateSystem(id: string, data: SystemBody) {
  return instance.put<SystemDetailDecorated>(`/${id}`, data).then((res) => res.data);
}

export async function deleteSystem(id: string) {
  return instance.delete<SystemDetailDecorated>(`/${id}`).then((res) => res.data);
}

export async function archiveSystems(ids: string[]) {
  return instance.post<SystemDetailDecorated[]>('/archive', { ids }).then((res) => res.data);
}

export async function attachTeam(systemId: string, teamId: string) {
  return instance.post<SystemDetailDecorated>(`/${systemId}/teams`, { teamId }).then((res) => res.data);
}

export async function detachTeam(systemId: string, teamId: string) {
  return instance.delete<SystemDetailDecorated>(`/${systemId}/teams`, { data: { teamId } }).then((res) => res.data);
}

export async function attachPrivateCloudProduct(systemId: string, privateCloudProductId: string) {
  return instance
    .post<SystemDetailDecorated>(`/${systemId}/private-cloud-products`, { privateCloudProductId })
    .then((res) => res.data);
}

export async function detachPrivateCloudProduct(systemId: string, privateCloudProductId: string) {
  return instance
    .delete<SystemDetailDecorated>(`/${systemId}/private-cloud-products`, { data: { privateCloudProductId } })
    .then((res) => res.data);
}

export async function attachPublicCloudProduct(systemId: string, publicCloudProductId: string) {
  return instance
    .post<SystemDetailDecorated>(`/${systemId}/public-cloud-products`, { publicCloudProductId })
    .then((res) => res.data);
}

export async function detachPublicCloudProduct(systemId: string, publicCloudProductId: string) {
  return instance
    .delete<SystemDetailDecorated>(`/${systemId}/public-cloud-products`, { data: { publicCloudProductId } })
    .then((res) => res.data);
}
