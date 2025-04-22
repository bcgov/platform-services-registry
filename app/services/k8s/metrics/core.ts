import axios from 'axios';
import {
  CLAB_METRICS_READER_TOKEN,
  KLAB_METRICS_READER_TOKEN,
  KLAB2_METRICS_READER_TOKEN,
  GOLDDR_METRICS_READER_TOKEN,
  GOLD_METRICS_READER_TOKEN,
  SILVER_METRICS_READER_TOKEN,
  EMERALD_METRICS_READER_TOKEN,
} from '@/config';
import { Cluster } from '@/prisma/types';
import { createK8sClusterConfigs } from '../helpers';

type PrometheusMetricResult = {
  metric: Record<string, string>;
  value: [number, string];
};

type PrometheusQueryData = {
  resultType: string;
  result: PrometheusMetricResult[];
};

type PrometheusQueryResponse = {
  status: string;
  data: PrometheusQueryData;
};

const { getK8sClusterToken, getK8sClusterClients } = createK8sClusterConfigs({
  [Cluster.KLAB]: KLAB_METRICS_READER_TOKEN,
  [Cluster.CLAB]: CLAB_METRICS_READER_TOKEN,
  [Cluster.KLAB2]: KLAB2_METRICS_READER_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_METRICS_READER_TOKEN,
  [Cluster.GOLD]: GOLD_METRICS_READER_TOKEN,
  [Cluster.SILVER]: SILVER_METRICS_READER_TOKEN,
  [Cluster.EMERALD]: EMERALD_METRICS_READER_TOKEN,
});

export const getK8sClients = getK8sClusterClients;

export async function queryPrometheus(query: string, cluster: Cluster) {
  const METRICS_URL = `https://prometheus-k8s-openshift-monitoring.apps.${cluster}.devops.gov.bc.ca`;
  const METRICS_TOKEN = getK8sClusterToken(cluster);
  const response = await axios.get<PrometheusQueryResponse>(`${METRICS_URL}/api/v1/query`, {
    headers: { Authorization: `Bearer ${METRICS_TOKEN}` },
    params: { query },
  });

  return response.data.data.result;
}
