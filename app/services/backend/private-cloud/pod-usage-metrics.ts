import { instance } from '../axios';

export async function getPodUsageMetrics(licencePlate: string, environment: string, cluster: string) {
  const result = await instance
    .get(
      `/private-cloud/analytics/pod-usage-metrics?licencePlate=${licencePlate}&environment=${environment}&cluster=${cluster}`,
    )
    .then((res) => res.data);
  return result;
}
