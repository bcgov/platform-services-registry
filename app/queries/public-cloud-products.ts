import { Ministry, Provider, ProjectStatus, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import {
  PublicCloudProductSimple,
  PublicCloudProductSearch,
  PublicCloudProductDetail,
  PublicCloudProductDetailDecorated,
} from '@/types/public-cloud';
import { getMatchingUserIds } from './users';

export const publicCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const publicCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  expenseAuthority: true,
  billing: {
    include: {
      expenseAuthority: true,
      signedBy: true,
      approvedBy: true,
    },
  },
  requests: {
    where: {
      active: true,
    },
  },
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
      include: publicCloudProductSimpleInclude,
      orderBy,
      session: session as never,
    }),
    prisma.publicCloudProject.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount } as PublicCloudProductSearch;
}

export async function getPublicCloudProduct(session: Session, licencePlate?: string) {
  if (!licencePlate) return null;

  const product: PublicCloudProductDetail | null = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: publicCloudProductDetailInclude,
    session: session as never,
  });

  if (!product) {
    return null;
  }

  return product as PublicCloudProductDetailDecorated;
}

export function excludeProductUsers(product: PublicCloudProductDetailDecorated | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, expenseAuthority, billing, ...rest } = product;

  return rest;
}
