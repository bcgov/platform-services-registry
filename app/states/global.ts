import { PrivateProductChange, PublicProductChange } from '@/helpers/product-change';
import { createGlobalValtio } from '@/helpers/valtio';
import { QuotaChangeStatus } from '@/services/backend/private-cloud/products';
import {
  PrivateCloudProductSimpleDecorated,
  PrivateCloudRequestSimpleDecorated,
  PrivateCloudProductDetailDecorated,
  PrivateCloudRequestDetailDecorated,
} from '@/types/private-cloud';
import {
  PublicCloudProductSimpleDecorated,
  PublicCloudRequestSimpleDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudRequestDetailDecorated,
} from '@/types/public-cloud';

export type Cloud = 'private-cloud' | 'public-cloud' | null;

export const { state: appState, useValtioState: useAppState } = createGlobalValtio<{
  cloud: Cloud;
  info: {
    DEPLOYMENT_TAG: string;
    APP_ENV: string;
    IS_LOCAL: boolean;
    IS_DEV: boolean;
    IS_TEST: boolean;
    IS_PROD: boolean;
    BASE_URL: string;
    LOGOUT_URL: string;
    TOKEN_URL: string;
  };
}>({
  cloud: null,
  info: {
    DEPLOYMENT_TAG: '',
    APP_ENV: '',
    IS_LOCAL: false,
    IS_DEV: false,
    IS_TEST: false,
    IS_PROD: false,
    BASE_URL: '',
    LOGOUT_URL: '',
    TOKEN_URL: '',
  },
});

export const { state: privateProductState, useValtioState: usePrivateProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PrivateCloudProductDetailDecorated | undefined;
  currentRequest: PrivateCloudRequestDetailDecorated | undefined;
  dataChangeOriginalRequest: PrivateProductChange | undefined;
  dataChangeRequestDecision: PrivateProductChange | undefined;
  dataChangeOriginalDecision: PrivateProductChange | undefined;
  editQuotaChangeStatus: QuotaChangeStatus | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
  currentRequest: undefined,
  dataChangeOriginalRequest: undefined,
  dataChangeRequestDecision: undefined,
  dataChangeOriginalDecision: undefined,
  editQuotaChangeStatus: undefined,
});

export const { state: publicProductState, useValtioState: usePublicProductState } = createGlobalValtio<{
  licencePlate: string;
  currentProduct: PublicCloudProductDetailDecorated | undefined;
  currentRequest: PublicCloudRequestDetailDecorated | undefined;
  dataChangeOriginalRequest: PublicProductChange | undefined;
}>({
  licencePlate: '',
  currentProduct: undefined,
  currentRequest: undefined,
  dataChangeOriginalRequest: undefined,
});
