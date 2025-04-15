import { Cluster, Prisma, ResourceRequestsEnv, ResourceRequests, PrivateCloudProductMemberRole } from '@prisma/client';
import { productSorts } from './common';

export const privateCloudProductMemberRoles = Object.values(PrivateCloudProductMemberRole);
export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const clusterNames = [
  {
    id: 1,
    name: 'clab',
    label: 'CLAB Calgary',
  },
  {
    id: 2,
    name: 'klab',
    label: 'KLAB Kamloops',
  },
  {
    id: 3,
    name: 'silver',
    label: 'Silver Kamloops',
  },
  {
    id: 4,
    name: 'gold',
    label: 'Gold Kamloops',
  },
  {
    id: 5,
    name: 'golddr',
    label: 'Gold (DR) Calgary',
  },
  {
    id: 6,
    name: 'klab2',
    label: 'KLAB2 Kamloops',
  },
  {
    id: 7,
    name: 'emerald',
    label: 'Emerald Hosting tier',
  },
];

export type DropdownOption = { label: string; value: string; key: number };

export const defaultResourceRequests = {
  cpu: 0.5,
  memory: 2,
  storage: 1,
};

export const privateCloudProductSorts = productSorts.concat([
  {
    label: 'Cluster (A-Z)',
    sortKey: 'cluster',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Cluster (Z-A)',
    sortKey: 'cluster',
    sortOrder: Prisma.SortOrder.desc,
  },
]);

export const environmentShortNames = {
  development: 'dev',
  test: 'test',
  production: 'prod',
  tools: 'tools',
} as const;

export const environmentLongKeys = Object.keys(environmentShortNames) as Array<keyof typeof environmentShortNames>;

export const environmentLongNames = {
  dev: 'development',
  test: 'test',
  prod: 'production',
  tools: 'tools',
} as const;

export const environmentShortKeys = Object.keys(environmentLongNames) as Array<keyof typeof environmentLongNames>;

export type ResourceRequestsEnvKeys = Array<keyof ResourceRequestsEnv>;
export type ResourceRequestsKeys = Array<keyof ResourceRequests>;

export const namespaceKeys: ResourceRequestsEnvKeys = ['development', 'test', 'production', 'tools'];
export const resourceKeys: ResourceRequestsKeys = ['cpu', 'memory', 'storage'];
