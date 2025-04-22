import { Prisma } from '@/prisma/types';

export type Product = Omit<Prisma.PublicCloudProductGetPayload<null>, 'updatedAt'>;
