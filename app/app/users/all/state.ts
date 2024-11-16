import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { userSorts } from '@/constants';
import { UserSearchBody } from '@/validation-schemas';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  roles: [],
  sortValue: userSorts[0].label,
  sortKey: userSorts[0].sortKey,
  sortOrder: userSorts[0].sortOrder,
};

export const pageState = proxy<UserSearchBody>(deepClone(initialValue));
