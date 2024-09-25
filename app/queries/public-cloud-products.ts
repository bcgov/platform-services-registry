import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import {
  PublicCloudProductSearch,
  PublicCloudProductDetail,
  PublicCloudProductDetailDecorated,
} from '@/types/public-cloud';
import { PublicCloudProductSearchBody } from '@/validation-schemas/public-cloud';
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
  page,
  pageSize,
  ministries,
  providers,
  status,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: PublicCloudProductSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PublicCloudProjectWhereInput;
}) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

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

  if (ministries && ministries.length > 0) {
    where.ministry = { in: ministries };
  }

  if (providers && providers.length > 0) {
    where.provider = { in: providers };
  }

  if (status && status.length > 0) {
    where.status = { in: status };
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
