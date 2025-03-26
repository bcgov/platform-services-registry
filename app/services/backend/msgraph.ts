import axios from 'axios';
import { SearchedUser } from '@/types/user';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/msgraph`,
});

export async function searchMSUsers(email: string) {
  const result = await instance
    .post<{ data: SearchedUser[]; totalCount: number }>('/search', { email })
    .then((res) => res.data);
  return result;
}
