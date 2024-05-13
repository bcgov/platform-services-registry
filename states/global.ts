import { PrivateCloudRequestGetPayload } from '@/app/api/private-cloud/requests/[id]/route';
import { PublicCloudRequestGetPayload } from '@/app/api/public-cloud/requests/[id]/route';
import { createGlobalValtio } from '@/helpers/valtio';
import { PrivateCloudProjectGetPayload } from '@/queries/private-cloud-products';
import { PublicCloudProjectGetPayload } from '@/queries/public-cloud-products';

export const { state: appState, useValtioState: useAppState } = createGlobalValtio({
  info: {
    DEPLOYMENT_TAG: '',
    APP_ENV: '',
    IS_LOCAL: false,
    IS_DEV: false,
    IS_TEST: false,
    IS_PROD: false,
    LOGOUT_URL: '',
  },
});

export const { state: privateProductState, useValtioState: usePrivateProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PrivateCloudProjectGetPayload | undefined;
  currentRequest: PrivateCloudRequestGetPayload | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
  currentRequest: undefined,
});

export const { state: publicProductState, useValtioState: usePublicProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PublicCloudProjectGetPayload | undefined;
  currentRequest: PublicCloudRequestGetPayload | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
  currentRequest: undefined,
});
