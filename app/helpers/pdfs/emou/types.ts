import { Prisma } from '@prisma/client';

export type Product = Omit<Prisma.PublicCloudProjectGetPayload<null>, 'updatedAt'>;
