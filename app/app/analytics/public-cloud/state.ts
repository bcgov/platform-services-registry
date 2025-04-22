import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { Provider } from '@/prisma/types';
import { AnalyticsPublicCloudFilterBody } from '@/validation-schemas/analytics-public-cloud';

const initialValue = {
  dates: [],
  userId: '',
  ministries: undefined,
  providers: [Provider.AWS, Provider.AWS_LZA, Provider.AZURE],
};

export const pageState = proxy<AnalyticsPublicCloudFilterBody>(deepClone(initialValue));
