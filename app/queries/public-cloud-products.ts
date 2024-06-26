import { Ministry, Provider, ProjectStatus, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import { getMatchingUserIds } from './users';

export type PublicCloudProjectGetPayload = Prisma.PublicCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    expenseAuthority: true;
    requests: {
      where: {
        active: true;
      };
    };
  };
}> &
  PublicCloudProjectDecorate;

export type PublicCloudProjectGetPayloadWithActiveRequest = PublicCloudProjectGetPayload & {
  activeRequest: Prisma.PublicCloudRequestGetPayload<null> | null;
};

export type PublicCloudProductSearchPayload = {
  docs: PublicCloudProjectGetPayload[];
  totalCount: number;
};

const defaultSortKey = 'updatedAt';

export async function searchPublicCloudProducts({
  session,
  skip,
  take,
  ministry,
  provider,
  status,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: {
  session: Session;
  skip: number;
  take: number;
  status?: ProjectStatus;
  ministry?: Ministry;
  provider?: Provider;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PublicCloudProjectWhereInput;
}) {
  const where: Prisma.PublicCloudProjectWhereInput = extraFilter ?? {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PublicCloudProject'> = { contains: search, mode: 'insensitive' };

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

  if (provider) {
    where.provider = provider as Provider;
  }

  if (status) {
    where.status = status;
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

export async function getPublicCloudProduct(session: Session, licencePlate?: string) {
  if (!licencePlate) return null;

  const product = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
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

  return product as PublicCloudProjectGetPayload;
}

export function excludeProductUsers(product: PublicCloudProjectGetPayload | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, expenseAuthority, ...rest } = product;

  return rest;
}
