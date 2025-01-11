import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { billingSorts } from '@/constants/billing';
import { BillingSearchBody } from '@/validation-schemas/billing';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  sortValue: billingSorts[0].label,
  sortKey: billingSorts[0].sortKey,
  sortOrder: billingSorts[0].sortOrder,
};

export const pageState = proxy<BillingSearchBody>(deepClone(initialValue));
