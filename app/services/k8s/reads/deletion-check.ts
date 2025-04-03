import { Cluster } from '@prisma/client';
import { ENABLE_DELETION_CHECK } from '@/config';
import { getK8sClients } from './core';

export interface DeletionCheck {
  namespace: boolean;
  pods: boolean;
  pvc: boolean;
  artifactory: boolean;
}

export async function checkDeletionAvailability(licencePlate: string, cluster: Cluster): Promise<DeletionCheck> {
  if (!ENABLE_DELETION_CHECK || licencePlate === '261403') {
    return {
      namespace: true,
      pods: true,
      pvc: true,
      artifactory: true,
    };
  }

  const result = {
    namespace: false,
    pods: false,
    pvc: false,
    artifactory: false,
  };

  const namespaceNames = ['dev', 'test', 'dev', 'tools'].map((env) => `${licencePlate}-${env.toLowerCase()}`);
  const { apiClient, customClient } = getK8sClients(cluster);

  const checkNamespace = async () => {
    const namespaceList = await Promise.all(
      namespaceNames.map((name) => apiClient.readNamespace({ name }).catch(() => null)),
    );

    return namespaceList.every((entry) => !!entry);
  };

  const checkArtifactory = async () => {
    const group = 'artifactory.devops.gov.bc.ca';
    const version = 'v1alpha1';
    const plural = 'artifactoryprojects';

    const artifactoryList: { items: [] }[] = await Promise.all(
      namespaceNames.map((namespace) =>
        customClient.listNamespacedCustomObject({ group, version, namespace, plural }).catch(() => null),
      ),
    );

    return artifactoryList.every((entry) => entry && entry.items.length === 0);
  };

  const checkPods = async () => {
    const podList = await Promise.all(
      namespaceNames.map((namespace) => apiClient.listNamespacedPod({ namespace }).catch(() => null)),
    );

    return podList.every(
      (entry) =>
        entry &&
        (entry.items.length === 0 ||
          entry.items.every((item) => !['Running', 'Pending'].includes(String(item.status?.phase)))),
    );
  };

  const checkPVC = async () => {
    const pvcList = await Promise.all(
      namespaceNames.map((namespace) => apiClient.listNamespacedPersistentVolumeClaim({ namespace }).catch(() => null)),
    );

    return pvcList.every((entry) => entry && entry.items.length === 0);
  };

  const [_namespace, _artifactory, _pods, _pvc] = await Promise.all([
    checkNamespace(),
    checkArtifactory(),
    checkPods(),
    checkPVC(),
  ]);

  result.namespace = _namespace;
  result.artifactory = _artifactory;
  result.pods = _pods;
  result.pvc = _pvc;

  return result;
}

export async function isEligibleForDeletion(licencePlate: string, cluster: Cluster) {
  const deleteCheckList = await checkDeletionAvailability(licencePlate, cluster);
  return Object.values(deleteCheckList).every((field) => field);
}
