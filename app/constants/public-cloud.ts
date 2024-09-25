import { Provider } from '@prisma/client';

export const providers = Object.values(Provider);

export const providerOptions = providers.map((v) => ({
  label: v === Provider.AZURE ? 'MS Azure' : v,
  value: v,
}));
