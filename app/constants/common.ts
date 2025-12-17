import { Prisma } from '@/prisma/client';

// export const AGMinistries = ['AG', 'PSSG', 'EMCR', 'HMA'];

export const TEAM_SA_PREFIX = 'z_pltsvc-tsa-';

export const productSorts = [
  {
    label: 'Product update date (new to old)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Product update date (old to new)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Product name (A-Z)',
    sortKey: 'name',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Product name (Z-A)',
    sortKey: 'name',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Product description (A-Z)',
    sortKey: 'description',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Product description (Z-A)',
    sortKey: 'description',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Product Licence plate (A-Z)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Product Licence plate (Z-A)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Ministry (A-Z)',
    sortKey: 'organizationId',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Ministry (Z-A)',
    sortKey: 'organizationId',
    sortOrder: Prisma.SortOrder.desc,
  },
];

export const requestSorts = [
  {
    label: 'Request update date (new to old)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.desc,
    inData: false,
  },
  {
    label: 'Request update date (old to new)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.asc,
    inData: false,
  },
  {
    label: 'Request create date (new to old)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.desc,
    inData: false,
  },
  {
    label: 'Request create date (old to new)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.asc,
    inData: false,
  },
  {
    label: 'Request review date (new to old)',
    sortKey: 'decisionDate',
    sortOrder: Prisma.SortOrder.desc,
    inData: false,
  },
  {
    label: 'Request review date (old to new)',
    sortKey: 'decisionDate',
    sortOrder: Prisma.SortOrder.asc,
    inData: false,
  },
  {
    label: 'Request complete date (new to old)',
    sortKey: 'provisionedDate',
    sortOrder: Prisma.SortOrder.desc,
    inData: false,
  },
  {
    label: 'Request complete date (old to new)',
    sortKey: 'provisionedDate',
    sortOrder: Prisma.SortOrder.asc,
    inData: false,
  },
  {
    label: 'Product name (A-Z)',
    sortKey: 'name',
    sortOrder: Prisma.SortOrder.asc,
    inData: true,
  },
  {
    label: 'Product name (Z-A)',
    sortKey: 'name',
    sortOrder: Prisma.SortOrder.desc,
    inData: true,
  },
  {
    label: 'Product description (A-Z)',
    sortKey: 'description',
    sortOrder: Prisma.SortOrder.asc,
    inData: true,
  },
  {
    label: 'Product description (Z-A)',
    sortKey: 'description',
    sortOrder: Prisma.SortOrder.desc,
    inData: true,
  },
  {
    label: 'Product Licence plate (A-Z)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.asc,
    inData: true,
  },
  {
    label: 'Product Licence plate (Z-A)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.desc,
    inData: true,
  },
];

export const requestSortsInProduct = requestSorts.filter((v) => v.sortKey !== 'licencePlate');

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const sampleMinistries = [
  {
    code: 'AEST',
    name: 'Post-Secondary Education and Future Skills Contacts',
  },
  {
    code: 'AG',
    name: 'Attorney General',
  },
  {
    code: 'AGRI',
    name: 'Agriculture and Food',
  },
  {
    code: 'ALC',
    name: 'Advisory Committee Revitalization',
  },
  {
    code: 'BCPC',
    name: 'British Columbia Provincial Committee',
  },
  {
    code: 'CITZ',
    name: 'Citizens Services',
  },
  {
    code: 'DBC',
    name: 'Drug Benefit Council',
  },
  {
    code: 'EAO',
    name: 'Environmental Assessment Office',
  },
  {
    code: 'EDUC',
    name: 'Education and Child Care',
  },
  {
    code: 'EMCR',
    name: 'Emergency Management and Climate Readiness',
  },
  {
    code: 'EMPR',
    name: 'Energy, Mines and Low Carbon Innovation',
  },
  {
    code: 'ENV',
    name: 'Environment and Climate Change Strategy',
  },
  {
    code: 'FIN',
    name: 'Finance',
  },
  {
    code: 'FLNR',
    name: 'Forests, Lands, Natural Resource',
  },
  {
    code: 'HLTH',
    name: 'Health',
  },
  {
    code: 'IRR',
    name: 'Indigenous Relations & Reconciliation',
  },
  {
    code: 'JEDC',
    name: 'Jobs, Economic Development and Innovation',
  },
  {
    code: 'LBR',
    name: 'Labour',
  },
  {
    code: 'LDB',
    name: 'Liquor Distribution Branch',
  },
  {
    code: 'MCF',
    name: 'Children and Family Development',
  },
  {
    code: 'MMHA',
    name: 'Mental Health and Addictions',
  },
  {
    code: 'PSA',
    name: 'Public Service Agency',
  },
  {
    code: 'PSSG',
    name: 'Public Safety and Solicitor General',
  },
  {
    code: 'SDPR',
    name: 'Social Development and Poverty Reduction',
  },
  {
    code: 'TCA',
    name: 'Tangible Capital Assets',
  },
  {
    code: 'TRAN',
    name: 'Transportation and Infrastructure',
  },
  {
    code: 'HMA',
    name: 'Housing and Municipal Affairs',
  },
  {
    code: 'WLRS',
    name: 'Water, Land and Resource Stewardship',
  },
];
