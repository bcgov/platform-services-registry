import { $Enums, Prisma } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { PublicCloudProductSearchCriteria } from '@/services/backend/public-cloud';

export const pageState = proxy<PublicCloudProductSearchCriteria & { showDownloadAlert: boolean }>({
  search: '',
  page: 1,
  pageSize: 10,
  ministry: '',
  provider: '',
  includeInactive: false,
  sortKey: '',
  sortOrder: Prisma.SortOrder.desc,
  showDownloadAlert: false,
});
