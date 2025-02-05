import { Task } from '@prisma/client';
import axios from 'axios';
import { taskSorts } from '@/constants/task';
import { SearchTask } from '@/types/task';
import { downloadFile } from '@/utils/browser';
import { TaskSearchBody } from '@/validation-schemas/task';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/tasks`,
});

export async function getAssignedTasks() {
  const result = await instance
    .get<
      (Pick<
        Task,
        'id' | 'type' | 'status' | 'createdAt' | 'completedAt' | 'completedBy' | 'data' | 'closedMetadata'
      > & { link: string; description: string })[]
    >('/assigned')
    .then((res) => res.data);
  return result;
}

function prepareSearchPayload(data: TaskSearchBody) {
  const reqData = { ...data };

  const selectedOption = taskSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  }
  return reqData;
}

export async function downloadTasks(data: TaskSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/download', reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'tasks.csv');
    return true;
  });

  return result;
}

export async function searchTasks(data: TaskSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post<{ data: SearchTask[]; totalCount: number }>('/search', reqData);

  return result.data;
}

export async function sendTaskEmail(taskId: string) {
  const result = await instance.get<true>(`/${taskId}/resend`);

  return result.data;
}
