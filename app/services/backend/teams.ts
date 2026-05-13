import axios from 'axios';
import { TeamDetailDecorated, TeamSimpleDecorated } from '@/types/system';
import { TeamBody } from '@/validation-schemas/team';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/teams`,
});

export async function listTeams() {
  return instance.get<TeamSimpleDecorated[]>('/').then((res) => res.data);
}

export async function createTeam(data: TeamBody) {
  return instance.post<TeamDetailDecorated>('/', data).then((res) => res.data);
}

export async function getTeam(id: string) {
  return instance.get<TeamDetailDecorated>(`/${id}`).then((res) => res.data);
}

export async function updateTeam(id: string, data: TeamBody) {
  return instance.put<TeamDetailDecorated>(`/${id}`, data).then((res) => res.data);
}

export async function deleteTeam(id: string) {
  return instance.delete<TeamDetailDecorated>(`/${id}`).then((res) => res.data);
}

export async function updateTeamMembers(id: string, members: TeamBody['members']) {
  return instance.put<TeamDetailDecorated>(`/${id}/members`, { members }).then((res) => res.data);
}

export async function attachSystem(teamId: string, systemId: string) {
  return instance.post<TeamDetailDecorated>(`/${teamId}/systems`, { systemId }).then((res) => res.data);
}

export async function detachSystem(teamId: string, systemId: string) {
  return instance.delete<TeamDetailDecorated>(`/${teamId}/systems`, { data: { systemId } }).then((res) => res.data);
}

export async function attachPrivateCloudProduct(teamId: string, privateCloudProductId: string) {
  return instance
    .post<TeamDetailDecorated>(`/${teamId}/private-cloud-products`, { privateCloudProductId })
    .then((res) => res.data);
}

export async function detachPrivateCloudProduct(teamId: string, privateCloudProductId: string) {
  return instance
    .delete<TeamDetailDecorated>(`/${teamId}/private-cloud-products`, { data: { privateCloudProductId } })
    .then((res) => res.data);
}

export async function attachPublicCloudProduct(teamId: string, publicCloudProductId: string) {
  return instance
    .post<TeamDetailDecorated>(`/${teamId}/public-cloud-products`, { publicCloudProductId })
    .then((res) => res.data);
}

export async function detachPublicCloudProduct(teamId: string, publicCloudProductId: string) {
  return instance
    .delete<TeamDetailDecorated>(`/${teamId}/public-cloud-products`, { data: { publicCloudProductId } })
    .then((res) => res.data);
}
