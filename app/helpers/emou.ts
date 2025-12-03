import { Provider } from '@/prisma/client';

export function getPublicCloudEmouFileName(productName: string, provider: Provider) {
  const isAWS = provider === Provider.AWS || provider === Provider.AWS_LZA;
  return `CSBC and ${productName} - ${isAWS ? 'AWS' : 'Microsoft Azure'} MOU.pdf`;
}
