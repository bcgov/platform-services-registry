import { Prisma, ProjectStatus } from '@prisma/client';
import { proxy, useSnapshot } from 'valtio';
import { productSorts } from '@/constants';
import { PublicCloudProductSearchBody } from '@/validation-schemas/public-cloud';

export const pageState = proxy<PublicCloudProductSearchBody>({
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
  status: [ProjectStatus.ACTIVE],
  sortValue: productSorts[0].label,
  sortKey: productSorts[0].sortKey,
  sortOrder: productSorts[0].sortOrder,
});
