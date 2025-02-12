import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { eventSorts } from '@/constants/event';
import { EventSearchBody } from '@/validation-schemas/event';

const initialValue = {
  page: 1,
  pageSize: 10,
  search: '',
  types: [],
  dates: [],
  userId: '',
  sortValue: eventSorts[0].label,
  sortKey: eventSorts[0].sortKey,
  sortOrder: eventSorts[0].sortOrder,
};

export const pageState = proxy<EventSearchBody>(deepClone(initialValue));
