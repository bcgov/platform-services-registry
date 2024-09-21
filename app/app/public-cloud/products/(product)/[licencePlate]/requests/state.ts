import { Prisma } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { PublicCloudProductSearchCriteria } from '@/services/backend/public-cloud/products';

export const pageState = proxy<Omit<PublicCloudProductSearchCriteria, 'licencePlate'>>({
  search: '',
  page: 1,
  pageSize: 10,
  ministry: '',
  provider: '',
  includeInactive: true,
  sortKey: '',
  sortOrder: Prisma.SortOrder.desc,
});
