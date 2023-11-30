import { Cluster, Ministry } from '@prisma/client';

export const clusters = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const ministries = Object.values(Ministry);
