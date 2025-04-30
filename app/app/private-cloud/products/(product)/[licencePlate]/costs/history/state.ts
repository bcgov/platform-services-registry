import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { YearlyCostPrivateCloudFilterBody } from '@/validation-schemas/private-cloud';

const initialValue = {
  year: new Date().getFullYear().toString(),
};

export const pageState = proxy<YearlyCostPrivateCloudFilterBody>(deepClone(initialValue));
