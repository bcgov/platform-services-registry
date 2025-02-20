import { Event } from '@prisma/client';
import axios from 'axios';
import { LoginSearchBody } from '@/validation-schemas/logins';
import { instance as baseInstance } from '../axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/analytics`,
});

export async function searchLogins(data: LoginSearchBody) {
  const result = await instance.post<{ data: Event[] }>('/general', data);
  return result.data;
}
