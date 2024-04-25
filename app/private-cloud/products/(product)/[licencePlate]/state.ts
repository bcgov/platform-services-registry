import { proxy, useSnapshot } from 'valtio';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/products/[licencePlate]/route';

export const productState = proxy<{ currentProduct: PrivateCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});
