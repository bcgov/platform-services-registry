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
