import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { getMatchingUserIds } from './users';

export async function searchPublicCloudProducts({
  session,
  skip,
  take,
  ministry,
  provider,
  active,
  search,
  sort,
  order,
  extraFilter,
}: {
  session: Session;
  skip: number;
  take: number;
  active: boolean;
  ministry?: string;
  provider?: string;
  search?: string;
  sort?: string;
  order?: Prisma.SortOrder;
  extraFilter?: Prisma.PublicCloudProjectWhereInput;
}) {
  const where: Prisma.PublicCloudProjectWhereInput = extraFilter ?? {};
  const orderBy =
    sort && order
      ? {
          [sort]: Prisma.SortOrder[order],
        }
      : {
          updatedAt: Prisma.SortOrder.desc,
        };

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PublicCloudProject'> = { contains: search, mode: 'insensitive' };

    where.OR = [
      { projectOwnerId: { in: matchingUserIds } },
      { primaryTechnicalLeadId: { in: matchingUserIds } },
      { secondaryTechnicalLeadId: { in: matchingUserIds } },
      { name: productSearchcreteria },
      { description: productSearchcreteria },
      { licencePlate: productSearchcreteria },
    ];
  }

  if (ministry) {
    where.ministry = ministry as $Enums.Ministry;
  }

  if (provider) {
    where.provider = provider as $Enums.Provider;
  }

  if (active) {
    where.status = $Enums.ProjectStatus.ACTIVE;
  }

  const [docs, totalCount] = await Promise.all([
    prisma.publicCloudProject.findMany({
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
    prisma.publicCloudProject.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}
