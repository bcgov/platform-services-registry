import { promises as fs } from 'fs';
import * as path from 'path';
import _compact from 'lodash/compact';
import _uniq from 'lodash/uniq';
import { Cluster } from '@/prisma/client';
import { getK8sClients } from '@/services/k8s/reads/core';
import { checkDeletionAvailability } from '@/services/k8s/reads/deletion-check';

interface PrivateCloudProduct {
  name: string;
  licencePlate: string;
  cluster: Cluster;
}

const readEnvData = async (env: string): Promise<PrivateCloudProduct[]> => {
  const filePath = path.join(__dirname, `pltsvc.PrivateCloudProduct.${env}.json`);
  const rawData = await fs.readFile(filePath, 'utf8');
  return JSON.parse(rawData);
};

async function main() {
  const devData = await readEnvData('dev');
  const testData = await readEnvData('test');
  const prodData = await readEnvData('prod');

  const devOnlyProducts = devData.filter((devProduct) => {
    return (
      !testData.some((testProduct) => testProduct.licencePlate === devProduct.licencePlate) &&
      !prodData.some((prodProduct) => prodProduct.licencePlate === devProduct.licencePlate)
    );
  });

  const clusters = _uniq(devOnlyProducts.map((product) => product.cluster));
  const clusterNamespaces: Record<Cluster, string[]> = {
    [Cluster.KLAB]: [],
    [Cluster.CLAB]: [],
    [Cluster.KLAB2]: [],
    [Cluster.GOLDDR]: [],
    [Cluster.GOLD]: [],
    [Cluster.SILVER]: [],
    [Cluster.EMERALD]: [],
  };

  const metadataByNamespace: Record<string, any> = {};

  for (const cluster of clusters) {
    const { apiClient } = getK8sClients(cluster);

    const res = await apiClient.listNamespace({});
    for (const item of res.items) {
      const namespace = item.metadata?.name ?? '';
      if (namespace) {
        clusterNamespaces[cluster].push(namespace);

        const annotations = item.metadata?.annotations ?? {};
        metadataByNamespace[namespace] = {
          productName: annotations['openshift.io/display-name'] ?? '',
          contacts: JSON.parse(annotations['contacts'] ?? '[]'),
        };
      }
    }
  }

  const result: Record<string, any> = {};

  for (const { licencePlate, cluster, name } of devOnlyProducts) {
    const namespaces = ['dev', 'test', 'prod', 'tools'].map((env) => `${licencePlate}-${env}`);
    const existingNamespace = namespaces.find((ns) => clusterNamespaces[cluster].includes(ns));

    if (!existingNamespace) continue;

    const deletionCheck = await checkDeletionAvailability(licencePlate, cluster);
    const isEmpty = Object.values(deletionCheck).every(Boolean);

    const metadata = namespaces.map((ns) => metadataByNamespace[ns]).find((meta) => meta !== undefined);

    result[licencePlate] = {
      cluster,
      licencePlate,
      name,
      deletionCheck,
      status: isEmpty ? 'EMPTY' : 'NOT_EMPTY',
      metadata,
    };
  }

  const outPath = path.join(__dirname, 'dangling-namespaces.json');
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf-8');
  return result;
}

main().then(console.log).catch(console.error);
