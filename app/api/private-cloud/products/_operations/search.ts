import { Session } from 'next-auth';
import { $Enums, Prisma } from '@prisma/client';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import { parsePaginationParams } from '@/helpers/pagination';

export default async function searchOp({
  session,
  search,
  page,
  pageSize,
  ministry,
  cluster,
  active,
  sortKey,
  sortOrder,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  cluster: string;
  active: boolean;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
}) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session: session as Session,
    skip,
    take,
    ministry,
    cluster,
    active,
    search,
    sortKey,
    sortOrder,
  });

  return { docs, totalCount };
}
