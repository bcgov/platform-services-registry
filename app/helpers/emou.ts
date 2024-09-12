import { Provider } from '@prisma/client';

export function getEmouFileName(productName: string, provider: Provider) {
  return `OCIO and ${productName} - ${provider === Provider.AWS ? 'AWS' : 'Microsoft Azure'} MOU.pdf`;
}
