import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { taskSorts } from '@/constants/task';
import { TaskSearchBody } from '@/validation-schemas/task';

const initialValue = {
  page: 1,
  pageSize: 10,
  search: '',
  types: [],
  statuses: [],
  sortValue: taskSorts[0].label,
  sortKey: taskSorts[0].sortKey,
  sortOrder: taskSorts[0].sortOrder,
};

export const pageState = proxy<TaskSearchBody>(deepClone(initialValue));
