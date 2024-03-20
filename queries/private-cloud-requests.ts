import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { getMatchingUserIds } from './users';

export async function searchActivePrivateCloudRequests({
  session,
  skip,
  take,
  ministry,
  cluster,
  search,
  sort,
  order,
}: {
  session: Session;
  skip: number;
  take: number;
  ministry?: string;
  cluster?: string;
  search?: string;
  sort?: string;
  order?: Prisma.SortOrder;
}) {
  const requestedProjectwhere: Prisma.PrivateCloudRequestedProjectWhereInput = {};

  let orderBy: { [key: string]: string } | { [key: string]: { [key: string]: string } } = {
    updatedAt: Prisma.SortOrder.desc,
  };

  if (sort && order) {
    if (sort === 'updatedAt') {
      orderBy = {
        updatedAt: Prisma.SortOrder[order],
      };
    } else {
      orderBy = { userRequestedProject: { [sort]: Prisma.SortOrder[order] } };
    }
  }

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudRequestedProject'> = {
      contains: search,
      mode: 'insensitive',
    };

    requestedProjectwhere.OR = [
      { projectOwnerId: { in: matchingUserIds } },
      { primaryTechnicalLeadId: { in: matchingUserIds } },
      { secondaryTechnicalLeadId: { in: matchingUserIds } },
      { name: productSearchcreteria },
      { description: productSearchcreteria },
      { licencePlate: productSearchcreteria },
    ];
  }

  if (ministry) {
    requestedProjectwhere.ministry = ministry as $Enums.Ministry;
  }

  if (cluster) {
    requestedProjectwhere.cluster = cluster as $Enums.Cluster;
  }

  const matchingRequestedPrivateProjects = await prisma.privateCloudRequestedProject.findMany({
    where: requestedProjectwhere,
    select: { id: true },
  });

  const where: Prisma.PrivateCloudRequestWhereInput = {
    active: true,
  };

  if (matchingRequestedPrivateProjects.length > 0) {
    where.userRequestedProjectId = { in: matchingRequestedPrivateProjects.map((proj) => proj.id) };
  }

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudRequest.findMany({
      where,
      skip,
      take,
      include: {
        userRequestedProject: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
      },
      orderBy,
      session: session as never,
    }),
    prisma.privateCloudRequest.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}
