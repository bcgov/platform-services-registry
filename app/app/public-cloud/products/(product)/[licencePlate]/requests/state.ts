import { proxy, useSnapshot } from 'valtio';
import { requestSorts } from '@/constants';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';

export const pageState = proxy<PublicCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
  status: [],
  types: [],
  sortValue: requestSorts[0].label,
  sortKey: requestSorts[0].sortKey,
  sortOrder: requestSorts[0].sortOrder,
});
