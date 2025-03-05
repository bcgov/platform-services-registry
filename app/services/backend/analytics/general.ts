import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';
import { instance as baseInstance } from '../axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/analytics`,
});

export async function getAnalyticsGeneralData(data: AnalyticsGeneralFilterBody) {
  const result = await instance.post<{ data: { date: string; Logins: string }[] }>('/general/chart-data', data);
  return result.data;
}

export async function downloadAnalyticsGeneral(data: AnalyticsGeneralFilterBody) {
  const result = await instance.post('general/download', data, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, 'analytics-general.csv');
    return true;
  });

  return result;
}
