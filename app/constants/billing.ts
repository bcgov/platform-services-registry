import { Prisma } from '@/prisma/types';
import { ProductBiliingStatus } from '@/types';

export const billingSorts = [
  {
    label: 'Billing create date (new to old)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Billing create date (old to new)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Billing last change date (new to old)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Billing last change date (old to new)',
    sortKey: 'updatedAt',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Billing sign date (new to old)',
    sortKey: 'signedAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Billing sign date (old to new)',
    sortKey: 'signedAt',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Billing approval date (new to old)',
    sortKey: 'approvedAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Billing approval date (old to new)',
    sortKey: 'approvedAt',
    sortOrder: Prisma.SortOrder.asc,
  },
];

export const productBillingStatusOptions = [
  { value: ProductBiliingStatus.NO_BILLING, label: 'No billing' },
  { value: ProductBiliingStatus.PENDING, label: 'Pending' },
  { value: ProductBiliingStatus.COMPLETED, label: 'Completed' },
];
