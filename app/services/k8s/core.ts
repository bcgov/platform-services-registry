import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
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

function configureKubeConfig(cluster: string, token: string) {
  const kc = new KubeConfig();
  kc.loadFromOptions({
    clusters: [
      {
        name: cluster,
        server: `https://api.${cluster}.devops.gov.bc.ca:6443`,
        skipTLSVerify: false,
      },
    ],
    users: [
      {
        name: 'my-user',
        token: token,
      },
    ],
    contexts: [
      {
        name: `${cluster}-context`,
        user: 'my-user',
        cluster: cluster,
      },
    ],
    currentContext: `${cluster}-context`,
  });

  return kc;
}

const k8sConfigs = {
  [Cluster.KLAB]: configureKubeConfig(Cluster.KLAB, KLAB_METRICS_READER_TOKEN),
  [Cluster.CLAB]: configureKubeConfig(Cluster.CLAB, CLAB_METRICS_READER_TOKEN),
  [Cluster.KLAB2]: configureKubeConfig(Cluster.KLAB2, KLAB2_METRICS_READER_TOKEN),
  [Cluster.GOLDDR]: configureKubeConfig(Cluster.GOLDDR, GOLDDR_METRICS_READER_TOKEN),
  [Cluster.GOLD]: configureKubeConfig(Cluster.GOLD, GOLD_METRICS_READER_TOKEN),
  [Cluster.SILVER]: configureKubeConfig(Cluster.SILVER, SILVER_METRICS_READER_TOKEN),
  [Cluster.EMERALD]: configureKubeConfig(Cluster.EMERALD, EMERALD_METRICS_READER_TOKEN),
};

export function getK8sClients(cluster: Cluster) {
  const kc = k8sConfigs[cluster];
  const apiClient = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);

  return {
    apiClient,
    metricsClient,
  };
}

export async function queryPrometheus(query: string, cluster: Cluster): Promise<PrometheusMetricResult[]> {
  const METRICS_URL = `https://prometheus-k8s-openshift-monitoring.apps.${cluster}.devops.gov.bc.ca`;
  const METRICS_TOKEN = k8sConfigs[cluster].users[0].token;
  const response = await axios.get<PrometheusQueryResponse>(`${METRICS_URL}/api/v1/query`, {
    headers: { Authorization: `Bearer ${METRICS_TOKEN}` },
    params: { query },
  });
  return response.data.data.result;
}
