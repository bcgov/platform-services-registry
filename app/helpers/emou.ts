import { Provider } from '@prisma/client';

export function getEmouFileName(productName: string, context: string) {
  const isAWS = context === Provider.AWS || context === Provider.AWS_LZA;
  return `OCIO and ${productName} - ${isAWS ? 'AWS' : 'Microsoft Azure'} MOU.pdf`;
}
