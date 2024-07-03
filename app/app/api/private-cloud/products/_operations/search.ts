import { ProjectStatus, Ministry, Cluster, Prisma } from '@prisma/client';
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
  status,
  sortKey,
  sortOrder,
  isTest,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry?: Ministry;
  cluster?: Cluster;
  status?: ProjectStatus;
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
    status,
    search,
    sortKey,
    sortOrder,
    isTest,
  });

  return { docs, totalCount };
}
