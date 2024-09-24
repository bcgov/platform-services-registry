import { Ministry, Cluster, ProjectStatus, Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { PrivateCloudProductDetail, PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { PrivateCloudProductSearchBody } from '@/validation-schemas/private-cloud';
import { getMatchingUserIds } from './users';

export const privateCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const privateCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

const defaultSortKey = 'updatedAt';

export async function searchPrivateCloudProducts({
  session,
  skip,
  take,
  page,
  pageSize,
  ministries,
  clusters,
  status,
  temporary,
  search = '',
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: PrivateCloudProductSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PrivateCloudProjectWhereInput;
}) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

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

  if (ministries && ministries.length > 0) {
    where.ministry = { in: ministries };
  }

  if (clusters && clusters.length > 0) {
    where.cluster = { in: clusters };
  }

  if (status && status.length > 0) {
    where.status = { in: status };
  }

  if (temporary && temporary.length === 1) {
    where.isTest = temporary[0] === 'YES';
  }

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudProject.findMany({
      where,
      skip,
      take,
      include: privateCloudProductSimpleInclude,
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

  const product: PrivateCloudProductDetail | null = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: privateCloudProductDetailInclude,
    session: session as never,
  });

  if (!product) {
    return null;
  }

  return product as PrivateCloudProductDetailDecorated;
}

export function excludeProductUsers(product: PrivateCloudProductDetailDecorated | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, ...rest } = product;

  return rest;
}
