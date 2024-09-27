import { ProjectStatus } from '@prisma/client';
import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { productSorts } from '@/constants';
import { PrivateCloudProductSearchBody } from '@/validation-schemas/private-cloud';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  status: [ProjectStatus.ACTIVE],
  temporary: [],
  sortValue: productSorts[0].label,
  sortKey: productSorts[0].sortKey,
  sortOrder: productSorts[0].sortOrder,
};

export const pageState = proxy<PrivateCloudProductSearchBody>(deepClone(initialValue));
