import axios from 'axios';
import { AnalyticsPublicCloudResponse } from '@/types/analytics-public';
import { downloadFile } from '@/utils/browser';
import { AnalyticsPublicCloudFilterBody } from '@/validation-schemas/analytics-public-cloud';
import { instance as baseInstance } from '../axios';

const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/analytics`,
});

export async function getAnalyticsPublicCloudData(
  data: AnalyticsPublicCloudFilterBody,
): Promise<AnalyticsPublicCloudResponse> {
  const result = await instance.post<AnalyticsPublicCloudResponse>('public-cloud/chart-data', data);
  return result.data;
}

export async function downloadPublicCloudAllRequests({ data }: { data: AnalyticsPublicCloudFilterBody }) {
  const result = await instance
    .post('public-cloud/download/all-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-public-cloud-all-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPublicCloudContactChangeRequests({ data }: { data: AnalyticsPublicCloudFilterBody }) {
  const result = await instance
    .post('public-cloud/download/contact-change-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-public-cloud-contact-change-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPublicCloudActiveProducts({ data }: { data: AnalyticsPublicCloudFilterBody }) {
  const result = await instance
    .post('public-cloud/download/active-products', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-public-cloud-active-products.csv');
      return true;
    });

  return result;
}

export async function downloadPublicCloudRequestsDecisionTime({ data }: { data: AnalyticsPublicCloudFilterBody }) {
  const result = await instance
    .post('public-cloud/download/request-decision-time', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-public-cloud-request-decision-time.csv');
      return true;
    });

  return result;
}

export async function downloadPublicCloudMinistryDistribution({ data }: { data: AnalyticsPublicCloudFilterBody }) {
  const result = await instance
    .post('public-cloud/download/ministry-distribution', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-public-cloud-ministry-distribution.csv');
      return true;
    });

  return result;
}
