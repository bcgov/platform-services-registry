import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { KLAB_METRICS_READER_TOKEN } from '@/config';

type UsageObj = {
  name: string;
  usage: {
    cpu: string;
    memory: string;
  };
  limits: {
    cpu: string;
    memory: string;
  };
  requests: {
    cpu: string;
    memory: string;
  };
};

// Conversion factors
const GiToKi = 1024 * 1024;
const MiToKi = 1024;
const cpuToM = 1000;

const convertCpu = (cpu: string): string => {
  if (cpu.includes('m')) {
    return cpu;
  }
  return `${parseFloat(cpu) * cpuToM}m`;
};

const convertMemory = (memory: string): string => {
  if (memory.includes('Gi')) {
    return `${parseFloat(memory.replace('Gi', '')) * GiToKi}Ki`;
  } else if (memory.includes('Mi')) {
    return `${parseFloat(memory.replace('Mi', '')) * MiToKi}Ki`;
  }
  return memory;
};

// Convert CPU and memory values to millicores and Ki units
const convertValues = (data: UsageObj[]): UsageObj[] =>
  data.map((entry) => ({
    ...entry,
    usage: {
      cpu: convertCpu(entry.usage.cpu),
      memory: convertMemory(entry.usage.memory),
    },
    limits: {
      cpu: convertCpu(entry.limits.cpu),
      memory: convertMemory(entry.limits.memory),
    },
    requests: {
      cpu: convertCpu(entry.requests.cpu),
      memory: convertMemory(entry.requests.memory),
    },
  }));

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

export default async function getPodMetrics(licencePlate: string, namespacePostfix: string, cluster: string) {
  const systemNamespace = licencePlate + '-' + namespacePostfix;
  const CLUSTER_METRICS_READER_TOKEN = {
    // clab: CLAB_METRICS_READER_TOKEN || '',
    klab: KLAB_METRICS_READER_TOKEN || '',
    // klab2: KLAB2_METRICS_READER_TOKEN || '',
    // golddr: GOLDDR_METRICS_READER_TOKEN || '',
    // gold: GOLD_METRICS_READER_TOKEN || '',
    // silver: SILVER_METRICS_READER_TOKEN || '',
    // emerald: EMERALD_METRICS_READER_TOKEN || '',
  };

  const clusterName = cluster.toLowerCase() as keyof typeof CLUSTER_METRICS_READER_TOKEN;

  const kc = configureKubeConfig(cluster, CLUSTER_METRICS_READER_TOKEN[clusterName]);
  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
  const usageData: UsageObj[] = [];

  try {
    const metrics = await metricsClient.getPodMetrics(systemNamespace);

    for (const item of metrics.items) {
      const podName = item.metadata.name;
      const podStatus = await k8sApi.readNamespacedPodStatus(podName, systemNamespace);

      const podResources: UsageObj = {
        name: podName,
        usage: item.containers[0].usage,
        limits: {
          cpu: podStatus.body.spec?.containers[0].resources?.limits?.cpu || '',
          memory: podStatus.body.spec?.containers[0].resources?.limits?.memory || '',
        },
        requests: {
          cpu: podStatus.body.spec?.containers[0].resources?.requests?.cpu || '',
          memory: podStatus.body.spec?.containers[0].resources?.requests?.memory || '',
        },
      };
      usageData.push(podResources);
    }

    return convertValues(usageData);
  } catch (error) {
    console.error('Error fetching pod metrics:', error);
  }
}
