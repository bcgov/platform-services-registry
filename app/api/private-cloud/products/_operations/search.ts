import { $Enums, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';

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
  isTest,
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
  isTest: boolean;
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
    isTest,
  });

  return { docs, totalCount };
}
