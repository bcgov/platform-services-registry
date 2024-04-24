import { Session } from 'next-auth';
import { $Enums, Prisma } from '@prisma/client';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';
import { parsePaginationParams } from '@/helpers/pagination';

export default async function searchOp({
  session,
  search,
  page,
  pageSize,
  ministry,
  provider,
  active,
  sortKey,
  sortOrder,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  provider: string;
  active: boolean;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
}) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { docs, totalCount } = await searchPublicCloudProducts({
    session: session as Session,
    skip,
    take,
    ministry,
    provider,
    active,
    search,
    sortKey,
    sortOrder,
  });

  return { docs, totalCount };
}
