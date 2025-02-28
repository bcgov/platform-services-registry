import axios from 'axios';
import { downloadFile } from '@/utils/browser';
import { AnalyticsPrivateCloudFilterBody } from '@/validation-schemas/analytics-private-cloud';
import { instance as baseInstance } from '../axios';

const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/analytics`,
});

interface AnalyticsPrivateCloudResponse {
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
  const result = await instance.post<AnalyticsPrivateCloudResponse>('private-cloud/filter', data);
  return result.data;
}

export async function downloadPrivateCloudAnalytics({ data }: { data: AnalyticsPrivateCloudFilterBody }) {
  const result = await instance.post('private-cloud/download', data, { responseType: 'blob' }).then((res) => {
    if (res.status === 204) return false;

    downloadFile(res.data, `analytics-private-cloud-${data.fetchKey}.csv`);
    return true;
  });

  return result;
}
