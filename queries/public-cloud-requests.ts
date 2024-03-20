import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { getMatchingUserIds } from './users';

export async function searchActivePublicCloudRequests({
  session,
  skip,
  take,
  ministry,
  provider,
  search,
  sortKey = 'updatedAt',
  sortOrder = 'desc',
}: {
  session: Session;
  skip: number;
  take: number;
  ministry?: string;
  provider?: string;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
}) {
  const requestedProjectwhere: Prisma.PublicCloudRequestedProjectWhereInput = {};

  const orderBy =
    sortKey === 'updatedAt'
      ? { updatedAt: Prisma.SortOrder[sortOrder] }
      : { userRequestedProject: { [sortKey]: Prisma.SortOrder[sortOrder] } };

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PublicCloudRequestedProject'> = {
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

  if (provider) {
    requestedProjectwhere.provider = provider as $Enums.Provider;
  }

  const matchingRequestedPublicProjects = await prisma.publicCloudRequestedProject.findMany({
    where: requestedProjectwhere,
    select: { id: true },
  });

  const where: Prisma.PublicCloudRequestWhereInput = {
    active: true,
  };

  if (matchingRequestedPublicProjects.length > 0) {
    where.userRequestedProjectId = { in: matchingRequestedPublicProjects.map((proj) => proj.id) };
  }

  const [docs, totalCount] = await Promise.all([
    prisma.publicCloudRequest.findMany({
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
    prisma.publicCloudRequest.count({
      where,
      session: session as never,
    }),
  ]);
  return { docs, totalCount };
}
