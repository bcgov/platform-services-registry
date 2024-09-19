import { Ministry, Cluster, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudRequestDetailDecorated, PrivateCloudRequestSearch } from '@/types/private-cloud';
import { getMatchingUserIds } from './users';

export const privateCloudRequestSimpleInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

export const privateCloudRequestDetailInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

const defaultSortKey = 'updatedAt';

export async function searchPrivateCloudRequests({
  session,
  skip,
  take,
  licencePlate,
  ministry,
  cluster,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
  isTest,
}: {
  session: Session;
  skip: number;
  take: number;
  licencePlate?: string;
  ministry?: string;
  cluster?: string;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PrivateCloudRequestWhereInput;
  isTest: boolean;
}) {
  const decisionDatawhere: Prisma.PrivateCloudRequestedProjectWhereInput = isTest
    ? {
        isTest: isTest,
      }
    : {};

  const orderBy =
    sortKey === 'updatedAt'
      ? { updatedAt: Prisma.SortOrder[sortOrder] }
      : { requestData: { [sortKey]: Prisma.SortOrder[sortOrder] } };

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudRequestedProject'> = {
      contains: search,
      mode: 'insensitive',
    };

    decisionDatawhere.OR = [
      { projectOwnerId: { in: matchingUserIds } },
      { primaryTechnicalLeadId: { in: matchingUserIds } },
      { secondaryTechnicalLeadId: { in: matchingUserIds } },
      { name: productSearchcreteria },
      { description: productSearchcreteria },
      { licencePlate: productSearchcreteria },
    ];
  }

  if (licencePlate) {
    decisionDatawhere.licencePlate = licencePlate;
  }

  if (ministry) {
    decisionDatawhere.ministry = ministry as Ministry;
  }

  if (cluster) {
    decisionDatawhere.cluster = cluster as Cluster;
  }

  const matchingRequestedPrivateProjects = await prisma.privateCloudRequestedProject.findMany({
    where: decisionDatawhere,
    select: { id: true },
  });

  const where: Prisma.PrivateCloudRequestWhereInput = extraFilter ?? {};
  where.decisionDataId = { in: matchingRequestedPrivateProjects.map((proj) => proj.id) };

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudRequest.findMany({
      where,
      skip,
      take,
      include: privateCloudRequestSimpleInclude,
      orderBy,
      session: session as never,
    }),
    prisma.privateCloudRequest.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount } as PrivateCloudRequestSearch;
}

export async function getPrivateCloudRequest(session: Session, id?: string) {
  if (!id) return null;

  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id,
    },
    include: privateCloudRequestDetailInclude,
    session: session as never,
  });

  if (!request) {
    return null;
  }

  return request as PrivateCloudRequestDetailDecorated;
}

export async function getLastClosedPrivateCloudRequest(licencePlate: string) {
  const previousRequest = await prisma.privateCloudRequest.findFirst({
    where: {
      licencePlate,
      active: false,
    },
    include: {
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
    orderBy: {
      updatedAt: Prisma.SortOrder.desc,
    },
  });

  return previousRequest;
}
