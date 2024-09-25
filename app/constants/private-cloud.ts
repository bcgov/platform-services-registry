import { Prisma } from '@prisma/client';

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
    label: 'Product Licence Plate (A-Z)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Product Licence Plate (Z-A)',
    sortKey: 'licencePlate',
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
    label: 'Product Licence Plate (A-Z)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.asc,
    inData: true,
  },
  {
    label: 'Product Licence Plate (Z-A)',
    sortKey: 'licencePlate',
    sortOrder: Prisma.SortOrder.desc,
    inData: true,
  },
];

export const requestSortsInProduct = requestSorts.filter((v) => v.sortKey !== 'licencePlate');
