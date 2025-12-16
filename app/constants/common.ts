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
    id: '777aa7a7aaaa777aa77aa701',
    code: 'AEST',
    name: 'Post-Secondary Education and Future Skills Contacts',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa702',
    code: 'AG',
    name: 'Attorney General',
    isAgMinistry: true,
  },
  {
    id: '777aa7a7aaaa777aa77aa703',
    code: 'AGRI',
    name: 'Agriculture and Food',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa704',
    code: 'ALC',
    name: 'Advisory Committee Revitalization',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa705',
    code: 'BCPC',
    name: 'British Columbia Provincial Committee',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa706',
    code: 'CITZ',
    name: 'Citizens Services',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa707',
    code: 'DBC',
    name: 'Drug Benefit Council',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa708',
    code: 'EAO',
    name: 'Environmental Assessment Office',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa709',
    code: 'EDUC',
    name: 'Education and Child Care',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa710',
    code: 'EMCR',
    name: 'Emergency Management and Climate Readiness',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa711',
    code: 'EMPR',
    name: 'Energy, Mines and Low Carbon Innovation',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa712',
    code: 'ENV',
    name: 'Environment and Climate Change Strategy',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa713',
    code: 'FIN',
    name: 'Finance',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa714',
    code: 'FLNR',
    name: 'Forests, Lands, Natural Resource',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa715',
    code: 'HLTH',
    name: 'Health',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa716',
    code: 'IRR',
    name: 'Indigenous Relations & Reconciliation',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa717',
    code: 'JEDC',
    name: 'Jobs, Economic Development and Innovation',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa718',
    code: 'LBR',
    name: 'Labour',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa719',
    code: 'LDB',
    name: 'Liquor Distribution Branch',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa721',
    code: 'MCF',
    name: 'Children and Family Development',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa722',
    code: 'MMHA',
    name: 'Mental Health and Addictions',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa723',
    code: 'PSA',
    name: 'Public Service Agency',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa724',
    code: 'PSSG',
    name: 'Public Safety and Solicitor General',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa725',
    code: 'SDPR',
    name: 'Social Development and Poverty Reduction',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa726',
    code: 'TCA',
    name: 'Tangible Capital Assets',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa727',
    code: 'TRAN',
    name: 'Transportation and Infrastructure',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa728',
    code: 'HMA',
    name: 'Housing and Municipal Affairs',
    isAgMinistry: false,
  },
  {
    id: '777aa7a7aaaa777aa77aa729',
    code: 'WLRS',
    name: 'Water, Land and Resource Stewardship',
    isAgMinistry: false,
  },
];
