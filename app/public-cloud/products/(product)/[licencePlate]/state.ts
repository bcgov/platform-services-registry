import { proxy, useSnapshot } from 'valtio';
import { PublicCloudProjectGetPayload } from '@/app/api/public-cloud/products/[licencePlate]/route';

export const productState = proxy<{ currentProduct: PublicCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});
