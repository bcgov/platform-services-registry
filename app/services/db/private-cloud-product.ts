import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { Prisma } from '@/prisma/client';
import { models } from '@/services/db';
import { PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { PrivateCloudProductSearchBody } from '@/validation-schemas/private-cloud';
import { getMatchingUserIds } from './user';

const defaultSortKey = 'updatedAt';

export type SearchPrivateCloudProductsProps = PrivateCloudProductSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PrivateCloudProductWhereInput;
};

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
}: SearchPrivateCloudProductsProps) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const where: Prisma.PrivateCloudProductWhereInput = extraFilter ?? {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudProduct'> = { contains: search, mode: 'insensitive' };

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

  const { data: docs, totalCount } = await models.privateCloudProduct.list(
    {
      where,
      skip,
      take,
      orderBy,
      includeCount: true,
    },
    session,
  );

  return { docs, totalCount };
}

export function excludePrivateProductPopulatedFields(product: PrivateCloudProductDetailDecorated | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, members, archivedAt, ...rest } = product;

  return rest;
}
