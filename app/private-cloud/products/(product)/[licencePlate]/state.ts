import { proxy, useSnapshot } from 'valtio';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/products/_operations/read';

export const productState = proxy<{ currentProduct: PrivateCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});
