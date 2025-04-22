import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { Cluster } from '@/prisma/types';
import { AnalyticsPrivateCloudFilterBody } from '@/validation-schemas/analytics-private-cloud';

const initialValue = {
  dates: [],
  userId: '',
  ministries: undefined,
  clusters: [Cluster.SILVER, Cluster.GOLD, Cluster.EMERALD],
  temporary: [],
};

export const pageState = proxy<AnalyticsPrivateCloudFilterBody>(deepClone(initialValue));
