import { ProjectStatus } from '@prisma/client';
import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { publicCloudProductSorts } from '@/constants';
import { PublicCloudProductSearchBody } from '@/validation-schemas/public-cloud';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
  status: [ProjectStatus.ACTIVE],
  sortValue: publicCloudProductSorts[0].label,
  sortKey: publicCloudProductSorts[0].sortKey,
  sortOrder: publicCloudProductSorts[0].sortOrder,
};

export const pageState = proxy<PublicCloudProductSearchBody>(deepClone(initialValue));
