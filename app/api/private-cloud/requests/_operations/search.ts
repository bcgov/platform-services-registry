import { Session } from 'next-auth';
import { $Enums, Prisma } from '@prisma/client';
import { searchPrivateCloudRequests } from '@/queries/private-cloud-requests';
import { parsePaginationParams } from '@/helpers/pagination';

export default async function searchOp({
  session,
  search,
  page,
  pageSize,
  ministry,
  cluster,
  includeInactive = false,
  sortKey,
  sortOrder,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  cluster: string;
  includeInactive: boolean;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
}) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { docs, totalCount } = await searchPrivateCloudRequests({
    session: session as Session,
    skip,
    take,
    ministry,
    cluster,
    search,
    sortKey,
    sortOrder,
    extraFilter: includeInactive ? {} : { active: true },
  });

  return { docs, totalCount };
}
