import { Cluster } from '@prisma/client';
import _get from 'lodash-es/get';
import { getK8sClients } from './core';

export async function getNamespace(namespace: string, cluster: Cluster) {
  const { apiClient } = getK8sClients(cluster);
  return apiClient.readNamespace(namespace);
}

export async function getSubnet(licencePlate: string, environment: string, cluster: Cluster) {
  const namespaceInfo = await getNamespace(`${licencePlate}-${environment}`, cluster);
  return _get(namespaceInfo.body, 'metadata.annotations.ncp/subnet-0');
}
