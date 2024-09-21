import { Prisma } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { PrivateCloudProductSearchCriteria } from '@/services/backend/private-cloud/products';

export const pageState = proxy<Omit<PrivateCloudProductSearchCriteria, 'licencePlate'>>({
  search: '',
  page: 1,
  pageSize: 10,
  ministry: '',
  cluster: '',
  includeInactive: true,
  sortKey: '',
  sortOrder: Prisma.SortOrder.desc,
  showTest: false,
});
