import { Prisma, ProjectStatus } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { productSorts } from '@/constants';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';

export const pageState = proxy<PrivateCloudRequestSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministry: undefined,
  cluster: undefined,
  includeInactive: true,
  showTest: true,
  sortKey: productSorts[0].sortKey,
  sortOrder: productSorts[0].sortOrder,
});
