import { proxy } from 'valtio';
import { requestSorts } from '@/constants';
import { DecisionStatus } from '@/prisma/types';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';

export const pageState = proxy<PublicCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
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
