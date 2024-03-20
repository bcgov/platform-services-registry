import axios from 'axios';
import {
  ENABLE_DELETION_CHECK,
  CLAB_SERVICE_ACCOUNT_TOKEN,
  KLAB_SERVICE_ACCOUNT_TOKEN,
  KLAB2_SERVICE_ACCOUNT_TOKEN,
  GOLDDR_SERVICE_ACCOUNT_TOKEN,
  GOLD_SERVICE_ACCOUNT_TOKEN,
  SILVER_SERVICE_ACCOUNT_TOKEN,
  EMERALD_SERVICE_ACCOUNT_TOKEN,
} from '@/config';

export interface DeletableField {
  namespaceDeletability: boolean;
  podsDeletability: boolean;
  pvcDeletability: boolean;
  provisionerDeletionChecked: boolean;
}

export interface CommonFields {
  id?: number;
  archived?: boolean;
  createdAt?: object;
  updatedAt?: object;
}

export interface ClusterNamespace extends CommonFields {
  namespaceId: number;
  clusterId: number;
  provisioned: boolean;
  quotaCpuSize: string;
  quotaMemorySize: string;
  quotaStorageSize: string;
  quotaSnapshotSize: string;
}

export interface ProjectNamespace extends CommonFields {
  name: string;
  profileId: number;
  clusters?: any;
}

export enum ProjectSetNamespace {
  Prod = 'prod',
  Test = 'test',
  Dev = 'dev',
  Tools = 'tools',
}

export default async function openshiftDeletionCheck(
  namespacePrefix: string,
  clusterNameParam: string,
): Promise<DeletableField> {
  if (!ENABLE_DELETION_CHECK) {
    return {
      namespaceDeletability: true,
      podsDeletability: true,
      pvcDeletability: true,
      provisionerDeletionChecked: true,
    };
  }

  const CLUSTER_SERVICE_ACCOUNT_TOKEN = {
    clab: CLAB_SERVICE_ACCOUNT_TOKEN || '',
    klab: KLAB_SERVICE_ACCOUNT_TOKEN || '',
    klab2: KLAB2_SERVICE_ACCOUNT_TOKEN || '',
    golddr: GOLDDR_SERVICE_ACCOUNT_TOKEN || '',
    gold: GOLD_SERVICE_ACCOUNT_TOKEN || '',
    silver: SILVER_SERVICE_ACCOUNT_TOKEN || '',
    emerald: EMERALD_SERVICE_ACCOUNT_TOKEN || '',
  };

  const clusterName = clusterNameParam.toLowerCase() as keyof typeof CLUSTER_SERVICE_ACCOUNT_TOKEN;

  const url = `https://api.${clusterName}.devops.gov.bc.ca:6443`;
  const BEARER_TOKEN = `Bearer ${CLUSTER_SERVICE_ACCOUNT_TOKEN[clusterName]}`;

  const OC_HEADER = {
    Authorization: BEARER_TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const checkResult: DeletableField = {
    namespaceDeletability: false,
    podsDeletability: false,
    pvcDeletability: false,
    provisionerDeletionChecked: true,
  };
  console.log(`Deleting namespace: ${namespacePrefix}`);
  if (namespacePrefix === '261403') {
    console.log(` Special case for Ian's test, for deleting gold project 261403`);
    return {
      namespaceDeletability: true,
      podsDeletability: true,
      pvcDeletability: true,
      provisionerDeletionChecked: true,
    };
  }
  // Namespaces check
  const allNamespacesUnderProject = Object.keys(ProjectSetNamespace).map(
    // @ts-ignore
    (element) => `${namespacePrefix}-${ProjectSetNamespace[element]}`,
  );

  try {
    const namespaceCheckUrl = `${url}/api/v1/namespaces`;
    console.log(`namespaceCheckUrl = ${namespaceCheckUrl}`);
    const { data } = await axios.get(`${namespaceCheckUrl}`, {
      headers: OC_HEADER,
      withCredentials: true,
    });

    const allAvailableNamespacesOnCluster = data.items.map((item: any) => item.metadata.name);
    const checker = (arr: string[], target: string[]) => target.every((v) => arr.includes(v));

    checkResult.namespaceDeletability = checker(allAvailableNamespacesOnCluster, allNamespacesUnderProject);
    console.log(`namespace in  ${clusterName} existence is ${checkResult.namespaceDeletability}`);
  } catch (err) {
    const message = `Namespace check failed, can not fetch all namespaces in cluster`;
    console.log(`${message}, err = ${err}`);
    checkResult.namespaceDeletability = false;

    return checkResult;
  }

  if (checkResult.namespaceDeletability) {
    try {
      // Pod and pvcdeletion checkcheck
      const allPodInProject: any = [];
      const podResponse = await Promise.all(
        allNamespacesUnderProject.map(async (namespace) =>
          axios.get(`${`${url}/api/v1/namespaces/${namespace}/pods`}`, {
            headers: OC_HEADER,
            withCredentials: true,
          }),
        ),
      );
      console.log(` pod response: ${podResponse}}`);
      podResponse.forEach((namespace) => namespace.data.items.forEach((pod: any) => allPodInProject.push(pod.status)));

      checkResult.podsDeletability = allPodInProject.every(
        (pod: any) => pod.phase !== 'Running' && pod.phase !== 'Pending',
      );
      console.log(`There's no running pod in  ${clusterName} is ${checkResult.podsDeletability}`);
      const pvcResponse = await Promise.all(
        allNamespacesUnderProject.map(async (namespace) =>
          axios.get(`${`${url}/api/v1/namespaces/${namespace}/persistentvolumeclaims`}`, {
            headers: OC_HEADER,
            withCredentials: true,
          }),
        ),
      );
      const allPVCInProject = pvcResponse.map((namespace) => namespace.data.items);

      checkResult.pvcDeletability = allPVCInProject.every((namespacePVC) => namespacePVC.length === 0);
      console.log(` PVC response: ${pvcResponse}}`);
      console.log(`There's no PVC in  ${clusterName} is ${checkResult.podsDeletability}`);
    } catch (err) {
      const message = `pod and pvc check failed, can not fetch info from namespaces`;
      console.log(`${message}, err = ${err}`);
      checkResult.pvcDeletability = false;
      checkResult.podsDeletability = false;

      return checkResult;
    }
  }
  return checkResult;
}

export async function isEligibleForDeletion(licencePlate: string, cluster: string) {
  const deleteCheckList = await openshiftDeletionCheck(licencePlate, cluster);
  return Object.values(deleteCheckList).every((field) => field);
}
