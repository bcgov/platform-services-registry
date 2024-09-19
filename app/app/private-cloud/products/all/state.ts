import { Prisma } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { PrivateCloudProductSearchCriteria } from '@/services/backend/private-cloud/products';

export const pageState = proxy<PrivateCloudProductSearchCriteria>({
  search: '',
  page: 1,
  pageSize: 10,
  licencePlate: '',
  ministry: '',
  cluster: '',
  includeInactive: false,
  sortKey: '',
  sortOrder: Prisma.SortOrder.desc,
  showTest: false,
});
