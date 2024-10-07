import { ProjectStatus } from '@prisma/client';
import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { privateCloudProductSorts } from '@/constants';
import { PrivateCloudProductSearchBody } from '@/validation-schemas/private-cloud';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  status: [ProjectStatus.ACTIVE],
  temporary: [],
  sortValue: privateCloudProductSorts[0].label,
  sortKey: privateCloudProductSorts[0].sortKey,
  sortOrder: privateCloudProductSorts[0].sortOrder,
};

export const pageState = proxy<PrivateCloudProductSearchBody>(deepClone(initialValue));
