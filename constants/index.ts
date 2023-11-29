import { Cluster, Ministry } from '@prisma/client';

export const clusters = Object.keys(Cluster)
  .map((key) => Cluster[key as keyof typeof Cluster])
  .filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.keys(Ministry).map((key) => Ministry[key as keyof typeof Ministry]);
