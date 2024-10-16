import { Cluster, Prisma, CPU, Memory, Storage } from '@prisma/client';
import _orderBy from 'lodash-es/orderBy';
import { extractNumbers } from '@/utils/string';
import { productSorts } from './common';

export const cpus = Object.values(CPU);
export const memories = Object.values(Memory);
export const storages = Object.values(Storage);
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
    label: 'Emerald Hosting Tier',
  },
];

export type ResourceMeta<T extends string> = Record<
  T,
  { value: T; label: string; labelNats: string; request: number; limit: number }
>;
export type StorageMeta = Record<Storage, { value: Storage; label: string; labelNats: string; size: number }>;

export type DropdownOption = { label: string; value: string; key: number };

const _cpuOptions: DropdownOption[] = [];
const _memoryOptions: DropdownOption[] = [];
const _stoageOptions: DropdownOption[] = [];

export const cpuMetadata = cpus.reduce<ResourceMeta<CPU>>((ret, value) => {
  const [request, limit] = extractNumbers(value);

  const label = `${request} CPU Request, ${limit} CPU Limit`;
  const labelNats = `cpu-request-${request}-limit-${limit}`;

  ret[value] = {
    value,
    label,
    labelNats,
    request,
    limit,
  };

  _cpuOptions.push({ value, label, key: request });
  return ret;
}, {} as ResourceMeta<CPU>);

export const memoryMetadata = memories.reduce<ResourceMeta<Memory>>((ret, value) => {
  const [request, limit] = extractNumbers(value);

  const label = `${request} GB Request, ${limit} GB Limit`;
  const labelNats = `memory-request-${request}-limit-${limit}`;

  ret[value] = {
    value,
    label,
    labelNats,
    request,
    limit,
  };

  _memoryOptions.push({ value, label, key: request });
  return ret;
}, {} as ResourceMeta<Memory>);

export const storageMetadata = storages.reduce<StorageMeta>((ret, value) => {
  const [size] = extractNumbers(value);

  const label = `${size} GB`;
  const labelNats = `storage-${size}`;

  ret[value] = {
    value,
    label,
    labelNats,
    size,
  };

  _stoageOptions.push({ value, label, key: size });
  return ret;
}, {} as StorageMeta);

export const cpuOptions = _orderBy(_cpuOptions, ['key'], ['asc']);
export const memoryOptions = _orderBy(_memoryOptions, ['key'], ['asc']);
export const stoageOptions = _orderBy(_stoageOptions, ['key'], ['asc']);

export const resourceMetadata = {
  cpu: cpuMetadata,
  memory: memoryMetadata,
  storage: storageMetadata,
};

export const resourceOptions = {
  cpu: cpuOptions,
  memory: memoryOptions,
  storage: stoageOptions,
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
