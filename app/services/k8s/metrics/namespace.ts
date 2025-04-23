import _get from 'lodash-es/get';
import { Cluster } from '@/prisma/client';
import { getK8sClients } from './core';

export async function getNamespace(namespace: string, cluster: Cluster) {
  const { apiClient } = getK8sClients(cluster);
  return apiClient.readNamespace({ name: namespace });
}

export async function getSubnet(licencePlate: string, environment: string, cluster: Cluster) {
  const namespaceInfo = await getNamespace(`${licencePlate}-${environment}`, cluster);
  return _get(namespaceInfo.metadata, 'annotations.ncp/subnet-0');
}
