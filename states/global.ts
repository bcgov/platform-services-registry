import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/products/_operations/read';
import { PublicCloudProjectGetPayload } from '@/app/api/public-cloud/products/_operations/read';
import { createGlobalValtio } from '@/helpers/valtio';

export const { state: privateProductState, useValtioState: usePrivateProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PrivateCloudProjectGetPayload | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
});

export const { state: publicProductState, useValtioState: usePublicProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PublicCloudProjectGetPayload | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
});
