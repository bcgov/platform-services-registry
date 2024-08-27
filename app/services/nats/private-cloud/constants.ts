import { CpuQuota, MemoryQuota, StorageQuota } from '@/validation-schemas/private-cloud';

export const Cluster = {
  CLAB: 'clab',
  KLAB: 'klab',
  SILVER: 'silver',
  GOLD: 'gold',
  GOLDDR: 'golddr',
  KLAB2: 'klab2',
  EMERALD: 'emerald',
};

export const RequestType = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
};

export interface CpuOption {
  name: string;
  cpuRequests: number;
  cpuLimits: number;
}

export type DefaultCpuOptionsKey = (typeof CpuQuota)['_type'];
export type DefaultMemoryOptionsKey = (typeof MemoryQuota)['_type'];
export type DefaultStorageOptionsKey = (typeof StorageQuota)['_type'];

export const DefaultCpuOptions: Record<DefaultCpuOptionsKey, CpuOption> = {
  CPU_REQUEST_0_5_LIMIT_1_5: {
    name: 'cpu-request-0.5-limit-1.5',
    cpuRequests: 0.5,
    cpuLimits: 1.5,
  },
  CPU_REQUEST_1_LIMIT_2: {
    name: 'cpu-request-1-limit-2',
    cpuRequests: 1,
    cpuLimits: 2,
  },
  CPU_REQUEST_2_LIMIT_4: {
    name: 'cpu-request-2-limit-4',
    cpuRequests: 2,
    cpuLimits: 4,
  },
  CPU_REQUEST_4_LIMIT_8: {
    name: 'cpu-request-4-limit-8',
    cpuRequests: 4,
    cpuLimits: 8,
  },
  CPU_REQUEST_8_LIMIT_16: {
    name: 'cpu-request-8-limit-16',
    cpuRequests: 8,
    cpuLimits: 16,
  },
  CPU_REQUEST_16_LIMIT_32: {
    name: 'cpu-request-16-limit-32',
    cpuRequests: 16,
    cpuLimits: 32,
  },
  CPU_REQUEST_32_LIMIT_64: {
    name: 'cpu-request-32-limit-64',
    cpuRequests: 32,
    cpuLimits: 64,
  },
  CPU_REQUEST_64_LIMIT_128: {
    name: 'cpu-request-64-limit-128',
    cpuRequests: 64,
    cpuLimits: 128,
  },
};

export interface MemoryOption {
  name: string;
  memoryRequests: string;
  memoryLimits: string;
}

export const DefaultMemoryOptions: Record<DefaultMemoryOptionsKey, MemoryOption> = {
  MEMORY_REQUEST_2_LIMIT_4: {
    name: 'memory-request-2-limit-4',
    memoryRequests: '2Gi',
    memoryLimits: '4Gi',
  },
  MEMORY_REQUEST_4_LIMIT_8: {
    name: 'memory-request-4-limit-8',
    memoryRequests: '4Gi',
    memoryLimits: '8Gi',
  },
  MEMORY_REQUEST_8_LIMIT_16: {
    name: 'memory-request-8-limit-16',
    memoryRequests: '8Gi',
    memoryLimits: '16Gi',
  },
  MEMORY_REQUEST_16_LIMIT_32: {
    name: 'memory-request-16-limit-32',
    memoryRequests: '16Gi',
    memoryLimits: '32Gi',
  },
  MEMORY_REQUEST_32_LIMIT_64: {
    name: 'memory-request-32-limit-64',
    memoryRequests: '32Gi',
    memoryLimits: '64Gi',
  },
  MEMORY_REQUEST_64_LIMIT_128: {
    name: 'memory-request-64-limit-128',
    memoryRequests: '64Gi',
    memoryLimits: '128Gi',
  },
  MEMORY_REQUEST_128_LIMIT_256: {
    name: 'memory-request-128-limit-256',
    memoryRequests: '128Gi',
    memoryLimits: '256Gi',
  },
};

export interface StorageOption {
  name: string;
  storagePvcCount: 60;
  storageFile: string;
  storageBackup: string;
  storageCapacity: string;
  storageBlock: string;
}

export const DefaultStorageOptions: Record<DefaultStorageOptionsKey, StorageOption> = {
  STORAGE_1: {
    name: 'storage-1',
    storagePvcCount: 60,
    storageFile: '1Gi',
    storageBackup: '1Gi',
    storageCapacity: '1Gi',
    storageBlock: '1Gi',
  },
  STORAGE_2: {
    name: 'storage-2',
    storagePvcCount: 60,
    storageFile: '2Gi',
    storageBackup: '1Gi',
    storageCapacity: '2Gi',
    storageBlock: '2Gi',
  },
  STORAGE_4: {
    name: 'storage-4',
    storagePvcCount: 60,
    storageFile: '4Gi',
    storageBackup: '2Gi',
    storageCapacity: '4Gi',
    storageBlock: '4Gi',
  },
  STORAGE_16: {
    name: 'storage-16',
    storagePvcCount: 60,
    storageFile: '16Gi',
    storageBackup: '8Gi',
    storageCapacity: '16Gi',
    storageBlock: '16Gi',
  },
  STORAGE_32: {
    name: 'storage-32',
    storagePvcCount: 60,
    storageFile: '32Gi',
    storageBackup: '16Gi',
    storageCapacity: '32Gi',
    storageBlock: '32Gi',
  },
  STORAGE_64: {
    name: 'storage-64',
    storagePvcCount: 60,
    storageFile: '64Gi',
    storageBackup: '32Gi',
    storageCapacity: '64Gi',
    storageBlock: '64Gi',
  },
  STORAGE_128: {
    name: 'storage-128',
    storagePvcCount: 60,
    storageFile: '128Gi',
    storageBackup: '64Gi',
    storageCapacity: '128Gi',
    storageBlock: '128Gi',
  },
  STORAGE_256: {
    name: 'storage-256',
    storagePvcCount: 60,
    storageFile: '256Gi',
    storageBackup: '128Gi',
    storageCapacity: '256Gi',
    storageBlock: '256Gi',
  },
  STORAGE_512: {
    name: 'storage-512',
    storagePvcCount: 60,
    storageFile: '512Gi',
    storageBackup: '256Gi',
    storageCapacity: '512Gi',
    storageBlock: '512Gi',
  },
};

export const snapshot = {
  name: 'snapshot-5',
  snapshotCount: 5,
};

export type QuotaOption = {
  cpu: CpuOption;
  memory: MemoryOption;
  storage: StorageOption;
};

export const testMessage = {
  action: 'create',
  profile_id: 6,
  cluster_id: 1,
  cluster_name: 'clab',
  display_name: 'Oamar test',
  description: 'asdf',
  ministry_id: 'AGRI',
  merge_type: 'auto',
  namespaces: [
    {
      namespace_id: 21,
      name: 'dad3d6-tools',
      quota: {
        cpu: 'cpu-request-0.5-limit-1.5',
        memory: 'memory-request-2-limit-4',
        storage: 'storage-1', // the one refers to the file
        snapshot: 'snapshot-5',
      },
      quotas: {
        cpu: { requests: 0.5, limits: 1.5 },
        memory: { requests: '2Gi', limits: '4Gi' },
        storage: {
          block: '1Gi',
          file: '1Gi',
          backup: '512Mi',
          capacity: '1Gi',
          pvc_count: 60,
        },
        snapshot: { count: 5 },
      },
    },
    {
      namespace_id: 22,
      name: 'dad3d6-dev',
      quota: {
        cpu: 'cpu-request-0.5-limit-1.5',
        memory: 'memory-request-2-limit-4',
        storage: 'storage-1',
        snapshot: 'snapshot-5',
      },
      quotas: {
        cpu: { requests: 0.5, limits: 1.5 },
        memory: { requests: '2Gi', limits: '4Gi' },
        storage: {
          block: '1Gi',
          file: '1Gi',
          backup: '512Mi',
          capacity: '1Gi',
          pvc_count: 60,
        },
        snapshot: { count: 5 },
      },
    },
    {
      namespace_id: 23,
      name: 'dad3d6-test',
      quota: {
        cpu: 'cpu-request-0.5-limit-1.5',
        memory: 'memory-request-2-limit-4',
        storage: 'storage-1',
        snapshot: 'snapshot-5',
      },
      quotas: {
        cpu: { requests: 0.5, limits: 1.5 },
        memory: { requests: '2Gi', limits: '4Gi' },
        storage: {
          block: '1Gi',
          file: '1Gi',
          backup: '512Mi',
          capacity: '1Gi',
          pvc_count: 60,
        },
        snapshot: { count: 5 },
      },
    },
    {
      namespace_id: 24,
      name: 'dad3d6-prod',
      quota: {
        cpu: 'cpu-request-0.5-limit-1.5',
        memory: 'memory-request-2-limit-4',
        storage: 'storage-1',
        snapshot: 'snapshot-5',
      },
      quotas: {
        cpu: { requests: 0.5, limits: 1.5 },
        memory: { requests: '2Gi', limits: '4Gi' },
        storage: {
          block: '1Gi',
          file: '1Gi',
          backup: '512Mi',
          capacity: '1Gi',
          pvc_count: 60,
        },
        snapshot: { count: 5 },
      },
    },
  ],
  contacts: [
    {
      user_id: 'okanji',
      provider: 'github',
      email: 'oamar.kanji@gov.bc.ca',
      rocketchat_username: null,
      role: 'lead',
    },
    {
      user_id: 'w8896699',
      provider: 'github',
      email: 'billy.li@gov.bc.ca',
      rocketchat_username: null,
      role: 'owner',
    },
  ],
};
