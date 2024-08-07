import { $Enums, Cluster, Ministry, Provider } from '@prisma/client';

export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.values(Ministry);

export const providers = Object.values(Provider);

export const providerOptions = providers.map((v) => ({
  label: v === $Enums.Provider.AZURE ? 'MS Azure' : v,
  value: v,
}));

export const ministryOptions = [
  {
    value: 'AEST',
    label: 'Post-Secondary Education and Future Skills Contacts',
  },
  {
    value: 'AG',
    label: 'Attorney General',
  },
  {
    value: 'AGRI',
    label: 'Agriculture and Food',
  },
  {
    value: 'ALC',
    label: 'Advisory Committee Revitalization',
  },
  {
    value: 'BCPC',
    label: 'British Columbia Provincial Committee',
  },
  {
    value: 'CITZ',
    label: 'Citizens Services',
  },
  {
    value: 'DBC',
    label: 'Drug Benefit Council',
  },
  {
    value: 'EAO',
    label: 'Environmental Assessment Office',
  },
  {
    value: 'EDUC',
    label: 'Education and Child Care',
  },
  {
    value: 'EMBC',
    label: 'Emergency Management',
  },
  {
    value: 'EMPR',
    label: 'Energy, Mines and Low Carbon Innovation',
  },
  {
    value: 'ENV',
    label: 'Environment and Climate Change Strategy',
  },
  {
    value: 'FIN',
    label: 'Finance',
  },
  {
    value: 'FLNR',
    label: 'Forests, Lands, Natural Resource',
  },
  {
    value: 'HLTH',
    label: 'Health',
  },
  {
    value: 'IRR',
    label: 'Indigenous Relations & Reconciliation',
  },
  {
    value: 'JEDC',
    label: 'Jobs, Economic Development and Innovation',
  },
  {
    value: 'LBR',
    label: 'Labour',
  },
  {
    value: 'LDB',
    label: 'Liquor Distribution Branch',
  },
  {
    value: 'MAH',
    label: 'Municipal Affairs and Housing',
  },
  {
    value: 'MCF',
    label: 'Children and Family Development',
  },
  {
    value: 'MMHA',
    label: 'Mental Health and Addictions',
  },
  {
    value: 'PSA',
    label: 'Public Service Agency',
  },
  {
    value: 'PSSG',
    label: 'Public Safety and Solicitor General',
  },
  {
    value: 'SDPR',
    label: 'Social Development and Poverty Reduction',
  },
  {
    value: 'TCA',
    label: 'Tangible Capital Assets',
  },
  {
    value: 'TRAN',
    label: 'Transportation and Infrastructure',
  },
  {
    value: 'HOUS',
    label: 'Ministry of Housing',
  },
];

export const AGMinistries = ['AG', 'PSSG', 'EMBC', 'HOUS'];

export const productSorts = [
  {
    sortKey: 'updatedAt',
    humanFriendlyName: 'Product last update (new to old)',
    sortOrder: 'desc',
  },
  {
    sortKey: 'updatedAt',
    humanFriendlyName: 'Product last update (old to new)',
    sortOrder: 'asc',
  },
  {
    sortKey: 'name',
    humanFriendlyName: 'Product name (A-Z)',
    sortOrder: 'asc',
  },
  {
    sortKey: 'name',
    humanFriendlyName: 'Product name (Z-A)',
    sortOrder: 'desc',
  },
  {
    sortKey: 'description',
    humanFriendlyName: 'Product description (A-Z)',
    sortOrder: 'asc',
  },
  {
    sortKey: 'description',
    humanFriendlyName: 'Product description (Z-A)',
    sortOrder: 'desc',
  },
  {
    sortKey: 'licencePlate',
    humanFriendlyName: 'Product Licence Plate (A-Z)',
    sortOrder: 'asc',
  },
  {
    sortKey: 'licencePlate',
    humanFriendlyName: 'Product Licence Plate (Z-A)',
    sortOrder: 'desc',
  },
];

export const defaultCpuOptionsLookup: { [key: string]: string } = {
  CPU_REQUEST_0_5_LIMIT_1_5: '0.5 CPU Request, 1.5 CPU Limit',
  CPU_REQUEST_1_LIMIT_2: '1 CPU Request, 2 CPU Limit',
  CPU_REQUEST_2_LIMIT_4: '2 CPU Request, 4 CPU Limit',
  CPU_REQUEST_4_LIMIT_8: '4 CPU Request, 8 CPU Limit',
  CPU_REQUEST_8_LIMIT_16: '8 CPU Request, 16 CPU Limit',
  CPU_REQUEST_16_LIMIT_32: '16 CPU Request, 32 CPU Limit',
  CPU_REQUEST_32_LIMIT_64: '32 CPU Request, 64 CPU Limit',
  CPU_REQUEST_64_LIMIT_128: '64 CPU Request, 128 CPU Limit',
};

export const defaultMemoryOptionsLookup: { [key: string]: string } = {
  MEMORY_REQUEST_2_LIMIT_4: '2 GB Request, 4 GB Limit',
  MEMORY_REQUEST_4_LIMIT_8: '4 GB Request, 8 GB Limit',
  MEMORY_REQUEST_8_LIMIT_16: '8 GB Request, 16 GB Limit',
  MEMORY_REQUEST_16_LIMIT_32: '16 GB Request, 32 GB Limit',
  MEMORY_REQUEST_32_LIMIT_64: '32 GB Request, 64 GB Limit',
  MEMORY_REQUEST_64_LIMIT_128: '64 GB Request, 128 GB Limit',
  MEMORY_REQUEST_128_LIMIT_256: '128 Request, 256 GB Limit',
};

export const defaultStorageOptionsLookup: { [key: string]: string } = {
  STORAGE_1: '1 GB',
  STORAGE_2: '2 GB',
  STORAGE_4: '4 GB',
  STORAGE_16: '16 GB',
  STORAGE_32: '32 GB',
  STORAGE_64: '64 GB',
  STORAGE_128: '128 GB',
  STORAGE_256: '256 GB',
  STORAGE_512: '512 GB',
};

export const defaultProvisionedResourceValues = {
  cpu: 'CPU: 0.5 CPU Request, 1.5 CPU Limit',
  memory: 'Memory: 2 GB Request, 4 GB Limit',
  storage: 'Storage: 1 GB',
};

export const TEAM_SA_PREFIX = 'z_pltsvc-tsa-';
