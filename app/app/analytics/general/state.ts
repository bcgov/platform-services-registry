import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';

const initialValue = {
  dates: [],
  userId: '',
};

export const pageState = proxy<AnalyticsGeneralFilterBody>(deepClone(initialValue));
