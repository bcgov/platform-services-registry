import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

export async function getPublicCloudProductForecast(licencePlate: string) {
  return instance.get(`/${licencePlate}/forecast`).then((res) => res.data);
}

export async function createPublicCloudForecast(
  licencePlate: string,
  data?: { monthlyValues?: unknown[]; horizonMonths?: number },
) {
  return instance.post(`/${licencePlate}/forecasts`, data ?? {}).then((res) => res.data);
}

export async function updatePublicCloudForecast(
  licencePlate: string,
  forecastId: string,
  data: {
    monthlyValues: { year: number; month: number; amount: number; currency: 'CAD' }[];
    horizonMonths: number;
  },
) {
  return instance.put(`/${licencePlate}/forecasts/${forecastId}`, data).then((res) => res.data);
}

export const adminInstance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/forecast`,
});

export async function getPlatformForecast() {
  return adminInstance.get('/').then((res) => res.data);
}

export async function downloadPlatformForecastExport(format: 'csv' | 'xlsx' = 'xlsx') {
  const result = await adminInstance.get('/export', { params: { format }, responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    const ext = format === 'csv' ? 'csv' : 'xlsx';
    downloadFile(res.data, `public-cloud-forecast.${ext}`, res.headers);
    return true;
  });

  return result;
}
