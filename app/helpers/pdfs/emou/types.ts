import { Prisma } from '@prisma/client';

export type Product = Omit<Prisma.PublicCloudProductGetPayload<null>, 'updatedAt'>;
