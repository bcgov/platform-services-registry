import { DecisionStatus } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { requestSorts } from '@/constants';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';

export const pageState = proxy<PublicCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
  status: [DecisionStatus.PENDING],
  types: [],
  sortValue: requestSorts[0].label,
  sortKey: requestSorts[0].sortKey,
  sortOrder: requestSorts[0].sortOrder,
});
