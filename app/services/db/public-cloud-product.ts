import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { parsePaginationParams } from '@/helpers/pagination';
import { models } from '@/services/db';
import { PublicCloudProductSearch, PublicCloudProductDetailDecorated } from '@/types/public-cloud';
import { PublicCloudProductSearchBody } from '@/validation-schemas/public-cloud';
import { getMatchingUserIds } from './user';

const defaultSortKey = 'updatedAt';

export type SearchPublicCloudProductsProps = PublicCloudProductSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PublicCloudProductWhereInput;
};

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
}: SearchPublicCloudProductsProps) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const where: Prisma.PublicCloudProductWhereInput = extraFilter ?? {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PublicCloudProduct'> = { contains: search, mode: 'insensitive' };

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

  const { data: docs, totalCount } = await models.publicCloudProduct.list(
    {
      where,
      skip,
      take,
      orderBy,
      includeCount: true,
    },
    session,
  );

  return { docs, totalCount } as PublicCloudProductSearch;
}

export function excludePublicProductPopulatedFields(product: PublicCloudProductDetailDecorated | null) {
  if (!product) return null;

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead, expenseAuthority, members, ...rest } = product;

  return {
    ...rest,
    members: members.map((member) => ({
      userId: member.userId,
      roles: member.roles,
    })),
  };
}
