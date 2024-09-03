import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';

const clusterName = 'silver';
const systemNamespace = 'de0974-prod';

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

async function getPodMetrics() {
  const kc = new KubeConfig();
  kc.loadFromOptions({
    clusters: [
      {
        name: clusterName,
        server: `https://api.${clusterName}.devops.gov.bc.ca:6443`,
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
        name: `${clusterName}-context`,
        user: 'my-user',
        cluster: clusterName,
      },
    ],
    currentContext: `${clusterName}-context`,
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

        const tmpObj: UsageObj = {
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

        usageData.push(tmpObj);
      } catch (podStatusError) {
        console.error(`Error fetching status for pod ${podName}:`, podStatusError);
      }
    }

    console.log(JSON.stringify(usageData, null, 2));
  } catch (err) {
    console.error('Error fetching metrics:', err);
  }
}

getPodMetrics();
