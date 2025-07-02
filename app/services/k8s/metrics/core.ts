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
import { Cluster } from '@/prisma/client';
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

const { getK8sClusterToken, getK8sClusterClients: getK8sClients } = createK8sClusterConfigs({
  [Cluster.KLAB]: KLAB_METRICS_READER_TOKEN,
  [Cluster.CLAB]: CLAB_METRICS_READER_TOKEN,
  [Cluster.KLAB2]: KLAB2_METRICS_READER_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_METRICS_READER_TOKEN,
  [Cluster.GOLD]: GOLD_METRICS_READER_TOKEN,
  [Cluster.SILVER]: SILVER_METRICS_READER_TOKEN,
  [Cluster.EMERALD]: EMERALD_METRICS_READER_TOKEN,
});

export { getK8sClusterToken, getK8sClients };

export async function queryPrometheus(query: string, cluster: Cluster) {
  const METRICS_URL = `https://prometheus-k8s-openshift-monitoring.apps.${cluster}.devops.gov.bc.ca`;
  const METRICS_TOKEN = getK8sClusterToken(cluster);

  const response = await axios.get<PrometheusQueryResponse>(`${METRICS_URL}/api/v1/query`, {
    headers: { Authorization: `Bearer ${METRICS_TOKEN}` },
    params: { query: query.trim() },
  });

  return response.data.data.result;
}

export function queryCapacity(cluster: Cluster) {
  return queryPrometheus(
    `
  sum
  (
    kube_node_status_capacity{resource="cpu", unit="core"}
    and on(node) kube_node_role{role="worker"}
  )
`,
    cluster,
  );
}

export function queryAllocatable(cluster: Cluster) {
  return queryPrometheus(
    `
  sum
  (
    kube_node_status_allocatable{resource="cpu", unit="core"}
    and on(node) kube_node_role{role="worker"}
  )
`,
    cluster,
  );
}

export function queryCpuRequests(cluster: Cluster) {
  return queryPrometheus(
    `
  sum
  (
    (
      kube_pod_container_resource_requests{resource="cpu", unit="core"}
      * on(namespace, pod) group_left()
      max(kube_pod_status_phase{phase=~"Running|Pending"} == 1) by (namespace, pod)
    )
    and on(node) kube_node_role{role="worker"}
  )
`,
    cluster,
  );
}

export function queryCpuUsage(cluster: Cluster) {
  return queryPrometheus(
    `
  sum
  (
    (
      rate(container_cpu_usage_seconds_total{container!="", image!=""}[5m])
      * on(namespace, pod) group_left()
      max(kube_pod_status_phase{phase=~"Running|Pending"} == 1) by (namespace, pod)
    )
    and on(node) kube_node_role{role="worker"}
  )
`,
    cluster,
  );
}
