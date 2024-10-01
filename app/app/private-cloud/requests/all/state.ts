import { DecisionStatus } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { requestSorts } from '@/constants';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';

export const pageState = proxy<PrivateCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  temporary: [],
  status: [DecisionStatus.PENDING],
  types: [],
  sortValue: requestSorts[0].label,
  sortKey: requestSorts[0].sortKey,
  sortOrder: requestSorts[0].sortOrder,
});
