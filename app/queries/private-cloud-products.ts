import { Ministry, Cluster, ProjectStatus, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import { getMatchingUserIds } from './users';

export type PrivateCloudProjectGetPayload = Prisma.PrivateCloudProjectGetPayload<{
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
  PrivateCloudProjectDecorate;

export type PrivateCloudProjectGetPayloadWithActiveRequest = PrivateCloudProjectGetPayload & {
  activeRequest: Prisma.PrivateCloudRequestGetPayload<null> | null;
};

export type PrivateCloudProductSearchPayload = {
  docs: PrivateCloudProjectGetPayload[];
  totalCount: number;
};

const defaultSortKey = 'updatedAt';

export async function searchPrivateCloudProducts({
  session,
  skip,
  take,
  ministry,
  cluster,
  status,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
  isTest,
}: {
  session: Session;
  skip: number;
  take: number;
  status?: ProjectStatus;
  ministry?: Ministry;
  cluster?: Cluster;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PrivateCloudProjectWhereInput;
  isTest: boolean;
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
    where.ministry = ministry as Ministry;
  }

  if (cluster) {
    where.cluster = cluster as Cluster;
  }

  if (status) {
    where.status = status;
  }

  if (isTest) {
    where.isTest = isTest;
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

export async function getPrivateCloudProduct(session: Session, licencePlate?: string) {
  if (!licencePlate) return null;

  const product = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
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
    session: session as never,
  });

  if (!product) {
    return null;
  }

  return product as PrivateCloudProjectGetPayload;
}

export function excludeProductUsers(product: PrivateCloudProjectGetPayload | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, ...rest } = product;

  return rest;
}
