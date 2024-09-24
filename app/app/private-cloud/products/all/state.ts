import { Prisma, ProjectStatus } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { productSorts } from '@/constants';
import { PrivateCloudProductSearchBody } from '@/validation-schemas/private-cloud';

export const pageState = proxy<PrivateCloudProductSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  status: [ProjectStatus.ACTIVE],
  temporary: [],
  sortKey: productSorts[0].sortKey,
  sortOrder: productSorts[0].sortOrder,
});
