import { $Enums, Prisma } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { PrivateCloudProductSearchCriteria } from '@/services/backend/private-cloud';

export const pageState = proxy<PrivateCloudProductSearchCriteria & { showDownloadAlert: boolean }>({
  search: '',
  page: 1,
  pageSize: 10,
  ministry: '',
  cluster: '',
  includeInactive: false,
  sortKey: '',
  sortOrder: Prisma.SortOrder.desc,
  showDownloadAlert: false,
});
