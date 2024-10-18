import { Task } from '@prisma/client';
import axios from 'axios';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/tasks`,
});

export async function getMyTasks() {
  const result = await instance
    .get<
      (Pick<
        Task,
        'id' | 'type' | 'status' | 'createdAt' | 'completedAt' | 'completedBy' | 'data' | 'closedMetadata'
      > & { link: string })[]
    >('/me')
    .then((res) => res.data);
  return result;
}
