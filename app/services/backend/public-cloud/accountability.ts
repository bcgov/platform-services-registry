import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { instance as parentInstance } from './instance';

export const instance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/products`,
});

export async function getPublicCloudAccountability(licencePlate: string) {
  return instance.get(`/${licencePlate}/accountability`).then((res) => res.data);
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
    monthlyValues: { year: number; month: number; amount: number; currency: 'USD' | 'CAD' }[];
    horizonMonths: number;
  },
) {
  return instance.put(`/${licencePlate}/forecasts/${forecastId}`, data).then((res) => res.data);
}

export const adminInstance = axios.create({
  ...parentInstance.defaults,
  baseURL: `${parentInstance.defaults.baseURL}/accountability`,
});

export async function getPlatformForecast() {
  return adminInstance.get('/forecast').then((res) => res.data);
}

export async function downloadPlatformForecastExport(format: 'csv' | 'xlsx' = 'xlsx') {
  const result = await adminInstance
    .get('/forecast/export', { params: { format }, responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadFile(res.data, `public-cloud-forecast.${ext}`, res.headers);
      return true;
    });

  return result;
}
