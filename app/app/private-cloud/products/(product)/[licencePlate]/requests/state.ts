import { proxy, useSnapshot } from 'valtio';
import { requestSortsInProduct } from '@/constants';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';

export const pageState = proxy<PrivateCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  temporary: [],
  status: [],
  types: [],
  sortValue: requestSortsInProduct[0].label,
  sortKey: requestSortsInProduct[0].sortKey,
  sortOrder: requestSortsInProduct[0].sortOrder,
});
