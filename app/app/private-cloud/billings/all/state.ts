import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { PrivateCloudBillingSearchBody } from '@/validation-schemas/private-cloud';

const initialValue = {
  yearMonth: new Date().toString(),
  page: 1,
  pageSize: 10,
};

export const pageState = proxy<PrivateCloudBillingSearchBody>(deepClone(initialValue));
