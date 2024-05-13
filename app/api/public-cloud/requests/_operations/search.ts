import { $Enums, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPublicCloudRequests } from '@/queries/public-cloud-requests';

export default async function searchOp({
  session,
  search,
  page,
  pageSize,
  ministry,
  provider,
  includeInactive = false,
  sortKey,
  sortOrder,
}: {
  session: Session;
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  provider: string;
  includeInactive: boolean;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
}) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { docs, totalCount } = await searchPublicCloudRequests({
    session: session as Session,
    skip,
    take,
    ministry,
    provider,
    search,
    sortKey,
    sortOrder,
    extraFilter: includeInactive ? {} : { active: true },
  });

  return { docs, totalCount };
}
