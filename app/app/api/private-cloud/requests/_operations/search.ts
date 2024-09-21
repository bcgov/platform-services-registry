import { Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPrivateCloudRequests } from '@/queries/private-cloud-requests';

export default async function searchOp({
  session,
  licencePlate,
  search,
  page,
  pageSize,
  ministry,
  cluster,
  includeInactive = false,
  sortKey,
  sortOrder,
  isTest,
}: {
  session: Session;
  licencePlate: string;
  search: string;
  page: number;
  pageSize: number;
  ministry: string;
  cluster: string;
  includeInactive: boolean;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  isTest: boolean;
}) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { docs, totalCount } = await searchPrivateCloudRequests({
    session: session as Session,
    skip,
    take,
    licencePlate,
    ministry,
    cluster,
    search,
    sortKey,
    sortOrder,
    extraFilter: includeInactive ? {} : { active: true },
    isTest,
  });

  return { docs, totalCount };
}
