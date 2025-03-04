import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { AnalyticsPrivateCloudFilterBody } from '@/validation-schemas/analytics-private-cloud';
import { instance as baseInstance } from '../axios';

const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/analytics`,
});

export interface AnalyticsPrivateCloudResponse {
  contactsChange: { date: string; 'Contact changes': number }[];
  allRequests: {
    date: string;
    'All requests': number;
    'Edit requests': number;
    'Create requests': number;
    'Delete requests': number;
  }[];
  quotaChange: {
    date: string;
    'All quota requests': number;
    'Approved quota requests': number;
    'Rejected quota requests': number;
  }[];
  activeProducts: ({
    date: string;
    'All Clusters': number;
  } & Record<string, number>)[];
  requestDecisionTime: { time: string; Percentage: number }[];
  ministryDistributionData: { _id: string; value: number }[][];
}

export async function getAnalyticsPrivateCloudData(
  data: AnalyticsPrivateCloudFilterBody,
): Promise<AnalyticsPrivateCloudResponse> {
  const result = await instance.post<AnalyticsPrivateCloudResponse>('private-cloud/chart-data', data);
  return result.data;
}

export async function downloadPrivateCloudQuotaChangeRequests({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/quota-change-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-quota-change-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudAllRequests({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/all-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-all-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudUsersWithQuotaEditRequests({
  data,
}: {
  data: AnalyticsPrivateCloudFilterBody;
}) {
  const result = await instance
    .post('private-cloud/download/users-with-quota-change-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-users-with-quota-change-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudContactChangeRequests({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/contact-change-requests', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-contact-change-requests.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudActiveProducts({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/active-products', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-active-products.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudRequestsDecisionTime({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/request-decision-time', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-request-decision-time.csv');
      return true;
    });

  return result;
}

export async function downloadPrivateCloudMinistryDistribution({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance
    .post('private-cloud/download/ministry-distribution', data, { responseType: 'blob' })
    .then((res) => {
      if (res.status === 204) return false;

      downloadFile(res.data, 'analytics-private-cloud-ministry-distribution.csv');
      return true;
    });

  return result;
}
