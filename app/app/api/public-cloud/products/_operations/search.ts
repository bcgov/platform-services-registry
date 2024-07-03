import { ProjectStatus, Ministry, Provider, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';

export default async function searchOp({
  session,
  search,
  page,
  pageSize,
  ministry,
  provider,
  status,
  sortKey,
  sortOrder,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry?: Ministry;
  provider?: Provider;
  status?: ProjectStatus;
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
    status,
    search,
    sortKey,
    sortOrder,
  });

  return { docs, totalCount };
}
