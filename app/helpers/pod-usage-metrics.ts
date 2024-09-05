import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';

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

const GiToKi = 1024 * 1024; // Gi to Ki
const MiToKi = 1024; // Mi to Ki
const cpuToM = 1000; // CPU units (1 CPU = 1000m)

// Convert CPU and memory values to millicores and Ki units
const convertValues = (data: UsageObj[]): UsageObj[] => {
  return data.map((entry) => {
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
      return memory; // If already in Ki
    };

    return {
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
    };
  });
};

export default async function getPodMetrics(licencePlate: string, namespacePostfix: string, cluster: string) {
  const systemNamespace = `${licencePlate}-${namespacePostfix}`;
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
        token: 'sha256~xxxxx', // oc whoami -t  -- personal temporary token
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

  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
  const usageData: UsageObj[] = [];

  try {
    const metrics = await metricsClient.getPodMetrics(systemNamespace);
    for (const item of metrics.items) {
      const podName = item.metadata.name;

      try {
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
      } catch (podStatusError) {
        console.error(`Error fetching status for pod ${podName}:`, podStatusError);
      }
    }

    return convertValues(usageData);
  } catch (err) {
    console.error('Error fetching metrics:', err);
  }
}
