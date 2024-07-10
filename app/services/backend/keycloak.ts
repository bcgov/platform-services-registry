import axios from 'axios';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/keycloak`,
});

export async function createKeycloakApiAccount() {
  const result = await instance.post('/api-accounts/user').then((res) => res.data);
  return result;
}

export async function getKeycloakApiAccount() {
  const result = await instance.get('/api-accounts/user').then((res) => res.data);
  return result;
}

export async function deleteKeycloakApiAccount() {
  const result = await instance.delete('/api-accounts/user').then((res) => res.data);
  return result;
}

export async function createKeycloakTeamApiAccount(roles: string[]) {
  const result = await instance.post('/api-accounts/team', { roles }).then((res) => res.data);
  return result;
}

export async function listKeycloakTeamApiAccounts() {
  const result = await instance.get('/api-accounts/team').then((res) => res.data);
  return result;
}

export async function getKeycloakApiTeamAccount(clientId: string) {
  const result = await instance.get(`/api-accounts/team/${clientId}`).then((res) => res.data);
  return result;
}

export async function updateKeycloakApiTeamAccount(clientId: string, roles: string[]) {
  const result = await instance.put(`/api-accounts/team/${clientId}`, { roles }).then((res) => res.data);
  return result;
}

export async function deleteKeycloakTeamApiAccount(clientId: string) {
  const result = await instance.delete(`/api-accounts/team/${clientId}`).then((res) => res.data);
  return result;
}

export async function manageUsersOfKeycloakTeamApiAccount(
  clientId: string,
  users: { email: string; type: 'add' | 'remove' }[],
) {
  const result = await instance.post(`/api-accounts/team/${clientId}/users`, { users }).then((res) => res.data);
  return result;
}
