import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { billingSorts } from '@/constants/billing';
import { PublicCloudBillingSearchBody } from '@/validation-schemas/public-cloud';

const initialValue = {
  search: '',
  licencePlate: null,
  page: 1,
  pageSize: 10,
  signed: undefined,
  approved: undefined,
  sortValue: billingSorts[0].label,
  sortKey: billingSorts[0].sortKey,
  sortOrder: billingSorts[0].sortOrder,
  includeMetadata: true,
};

export const pageState = proxy<PublicCloudBillingSearchBody>(deepClone(initialValue));
