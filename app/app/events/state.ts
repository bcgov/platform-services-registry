import { Prisma } from '@prisma/client';

export const eventSorts = [
  {
    label: 'Create date (new to old)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Create date (old to new)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.asc,
  },
];

const initialValue = {
  page: 1,
  pageSize: 10,
  sortValue: eventSorts[0].label,
  sortKey: eventSorts[0].sortKey,
  sortOrder: eventSorts[0].sortOrder,
};

export const pageState = initialValue;
