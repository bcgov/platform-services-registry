import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
const clusterName = 'silver';
const systemNamespace = 'de0974-prod';

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
        token: 'sha256~4n92GRkziI5wpqjTPPD_CFRngs9qNbsSgL01wsfUzRM', // oc whoami -t  -- personal temporary token
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

  try {
    const pods = await k8sApi.listNamespacedPod(systemNamespace);
    console.log('pods body', JSON.stringify(pods.body, null, 2));

    const metrics = await metricsClient.getPodMetrics(systemNamespace);
    metrics.items.forEach((item) => {
      console.log(item.metadata.name, item.containers);
    });
  } catch (err) {
    console.error('Error fetching metrics:', err);
  }
}

getPodMetrics();
