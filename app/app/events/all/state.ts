import { EventType, Prisma } from '@prisma/client';
import { proxy } from 'valtio';

export const eventSorts = [
  {
    label: 'Event date (new to old)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Event date (old to new)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.asc,
  },
];

type PageState = {
  page: number;
  pageSize: number;
  search: string;
  events: EventType[];
  sortValue: string;
  sortKey: string;
  sortOrder: 'asc' | 'desc';
};

export const pageState = proxy<PageState>({
  page: 1,
  pageSize: 10,
  search: '',
  events: [],
  sortValue: eventSorts[0].label,
  sortKey: eventSorts[0].sortKey,
  sortOrder: eventSorts[0].sortOrder,
});
