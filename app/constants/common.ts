import { Ministry, Prisma } from '@prisma/client';

export const ministries = Object.values(Ministry);

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
    sortKey: 'ministry',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Ministry (Z-A)',
    sortKey: 'ministry',
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
