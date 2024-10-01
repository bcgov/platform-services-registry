import { Provider } from '@prisma/client';

export function getEmouFileName(productName: string, provider: Provider) {
  const isAWS = provider === Provider.AWS || provider === Provider.AWS_LZA;
  return `OCIO and ${productName} - ${isAWS ? 'AWS' : 'Microsoft Azure'} MOU.pdf`;
}
