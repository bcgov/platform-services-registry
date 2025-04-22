import { proxy } from 'valtio';
import { requestSorts } from '@/constants';
import { DecisionStatus } from '@/prisma/types';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';

export const pageState = proxy<PrivateCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  temporary: [],
  status: [
    DecisionStatus.PENDING,
    DecisionStatus.APPROVED,
    DecisionStatus.AUTO_APPROVED,
    DecisionStatus.PARTIALLY_PROVISIONED,
  ],
  types: [],
  sortValue: requestSorts[0].label,
  sortKey: requestSorts[0].sortKey,
  sortOrder: requestSorts[0].sortOrder,
});
