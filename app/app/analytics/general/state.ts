import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';

const initialValue = {
  dates: [new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), new Date().toISOString()],
  userId: '',
};

export const pageState = proxy<AnalyticsGeneralFilterBody>(deepClone(initialValue));
