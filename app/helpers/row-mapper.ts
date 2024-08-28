import { PrivateCloudProductSimpleDecorated, PrivateCloudRequestSimpleDecorated } from '@/types/private-cloud';
import { PublicCloudProductSimpleDecorated, PublicCloudRequestSimpleDecorated } from '@/types/public-cloud';

export const processPrivateCloudProductData = (product: PrivateCloudProductSimpleDecorated) => {
  return {
    ...product,
    activeRequest: product.requests.length
      ? {
          ...product.requests[0],
        }
      : null,
  };
};

export const processPrivateCloudRequestData = (request: PrivateCloudRequestSimpleDecorated) => {
  return {
    ...request,
  };
};

export const processPublicCloudProductData = (product: PublicCloudProductSimpleDecorated) => {
  return {
    ...product,
    activeRequest: product.requests.length
      ? {
          ...product.requests[0],
        }
      : null,
  };
};

export const processPublicCloudRequestData = (request: PublicCloudRequestSimpleDecorated) => {
  return {
    ...request,
  };
};
