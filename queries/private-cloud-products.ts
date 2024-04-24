import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import { getMatchingUserIds } from './users';

const defaultSortKey = 'updatedAt';

export async function searchPrivateCloudProducts({
  session,
  skip,
  take,
  ministry,
  cluster,
  active,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: {
  session: Session;
  skip: number;
  take: number;
  active: boolean;
  ministry?: string;
  cluster?: string;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PrivateCloudProjectWhereInput;
}) {
  const where: Prisma.PrivateCloudProjectWhereInput = extraFilter ?? {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudProject'> = { contains: search, mode: 'insensitive' };

    where.OR = [
      { name: productSearchcreteria },
      { description: productSearchcreteria },
      { licencePlate: productSearchcreteria },
    ];

    if (matchingUserIds.length > 0) {
      where.OR.push(
        { projectOwnerId: { in: matchingUserIds } },
        { primaryTechnicalLeadId: { in: matchingUserIds } },
        { secondaryTechnicalLeadId: { in: matchingUserIds } },
      );
    }
  }

  if (ministry) {
    where.ministry = ministry as $Enums.Ministry;
  }

  if (cluster) {
    where.cluster = cluster as $Enums.Cluster;
  }

  if (active) {
    where.status = $Enums.ProjectStatus.ACTIVE;
  }

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudProject.findMany({
      where,
      skip,
      take,
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
        requests: {
          where: {
            active: true,
          },
        },
      },
      orderBy,
      session: session as never,
    }),
    prisma.privateCloudProject.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}

export type PrivateCloudProductSearchPayload = {
  docs: (Prisma.PrivateCloudProjectGetPayload<{
    include: {
      projectOwner: true;
      primaryTechnicalLead: true;
      secondaryTechnicalLead: true;
      requests: {
        where: {
          active: true;
        };
      };
    };
  }> &
    PrivateCloudProjectDecorate)[];
  totalCount: number;
};
