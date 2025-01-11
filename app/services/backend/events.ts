import { Event } from '@prisma/client';
import axios from 'axios';
import { eventSorts, ExtendedEvent } from '@/constants/event';
import { downloadFile } from '@/utils/browser';
import { EventSearchBody } from '@/validation-schemas/event';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/events`,
});

function prepareSearchPayload(data: EventSearchBody) {
  const reqData = { ...data };

  const selectedOption = eventSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  }
  return reqData;
}

export async function downloadEvents(data: EventSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post('/download', reqData, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'events.csv');
    return true;
  });

  return result;
}

export async function searchEvents(data: EventSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance.post<{ data: ExtendedEvent[]; totalCount: number }>('/search', reqData);
  return result.data;
}
