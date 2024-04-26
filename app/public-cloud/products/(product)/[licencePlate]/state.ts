import { proxy, useSnapshot } from 'valtio';
import { PublicCloudProjectGetPayload } from '@/app/api/public-cloud/products/_operations/read';

export const productState = proxy<{ currentProduct: PublicCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});
