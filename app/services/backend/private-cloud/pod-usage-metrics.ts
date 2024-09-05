import { instance } from '../axios';

export async function getPodUsageMetrics(licencePlate: string, namespacePostfix: string, cluster: string) {
  const result = await instance
    .get(
      `/private-cloud/analytics/pod-usage-metrics?licencePlate=${licencePlate}&namespacePostfix=${namespacePostfix}&cluster=${cluster}`,
    )
    .then((res) => res.data);
  return result;
}
