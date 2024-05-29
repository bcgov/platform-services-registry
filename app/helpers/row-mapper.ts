import { PrivateCloudProjectGetPayload } from '@/queries/private-cloud-products';
import { PrivateCloudRequestSearchedItemPayload } from '@/queries/private-cloud-requests';
import { PublicCloudProjectGetPayload } from '@/queries/public-cloud-products';
import { PublicCloudRequestSearchedItemPayload } from '@/queries/public-cloud-requests';

export const processPrivateCloudProductData = (product: PrivateCloudProjectGetPayload) => {
  return {
    ...product,
    activeRequest: product.requests.length
      ? {
          ...product.requests[0],
        }
      : null,
  };
};

export const processPrivateCloudRequestData = (request: PrivateCloudRequestSearchedItemPayload) => {
  return {
    ...request,
  };
};

export const processPublicCloudProductData = (product: PublicCloudProjectGetPayload) => {
  return {
    ...product,
    activeRequest: product.requests.length
      ? {
          ...product.requests[0],
        }
      : null,
  };
};

export const processPublicCloudRequestData = (request: PublicCloudRequestSearchedItemPayload) => {
  return {
    ...request,
  };
};
