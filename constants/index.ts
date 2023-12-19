import { Cluster, Ministry, Provider } from '@prisma/client';

export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.values(Ministry);

export const providers = Object.values(Provider);
