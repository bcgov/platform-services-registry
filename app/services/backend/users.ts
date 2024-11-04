import { User } from '@prisma/client';
import axios from 'axios';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/users`,
});

export async function searchUsers(email: string) {
  const result = await instance
    .post<{ data: User[]; totalCount: number }>('/search', { email })
    .then((res) => res.data);
  return result;
}
