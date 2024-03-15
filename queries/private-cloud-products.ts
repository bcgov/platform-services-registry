import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';

export async function searchPrivateCloudProducts({
  session,
  skip,
  take,
  ministry,
  cluster,
  active,
  search,
  extraFilter,
}: {
  session: Session;
  skip: number;
  take: number;
  active: boolean;
  ministry?: string;
  cluster?: string;
  search?: string;
  extraFilter?: Prisma.PrivateCloudProjectWhereInput;
}) {
  const where: Prisma.PrivateCloudProjectWhereInput = extraFilter ?? {};

  if (search) {
    const userSearchcreteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };
    const matchingUsers = await prisma.user.findMany({
      where: {
        OR: [{ email: userSearchcreteria }, { firstName: userSearchcreteria }, { lastName: userSearchcreteria }],
      },
      select: { id: true },
    });

    const matchingUserIds = matchingUsers.map((user) => user.id);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudProject'> = { contains: search, mode: 'insensitive' };

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
      orderBy: [
        {
          updatedAt: Prisma.SortOrder.desc,
        },
      ],
      session: session as never,
    }),
    prisma.privateCloudProject.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}
