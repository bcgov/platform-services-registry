import { Cluster, Ministry, Provider } from '@prisma/client';

export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.values(Ministry);

export const providers = Object.values(Provider);

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
