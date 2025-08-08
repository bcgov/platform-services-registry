import _difference from 'lodash-es/difference';
import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { Prisma } from '@/prisma/client';
import { models } from '@/services/db';
import { ProductBiliingStatus } from '@/types';
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
  billingStatus,
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
        { expenseAuthorityId: { in: matchingUserIds } },
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

  if (billingStatus && billingStatus.length > 0 && billingStatus.length < 3) {
    const licencePlates: string[] = [];
    const [products, pendingBillings, completedBillings] = await Promise.all([
      prisma.publicCloudProduct.findMany({
        where: {},
        select: { licencePlate: true },
        distinct: ['licencePlate'],
      }),
      prisma.publicCloudBilling.findMany({
        where: { OR: [{ signed: false }, { approved: false }] },
        select: { licencePlate: true },
        distinct: ['licencePlate'],
      }),
      prisma.publicCloudBilling.findMany({
        where: { signed: true, approved: true },
        select: { licencePlate: true },
        distinct: ['licencePlate'],
      }),
    ]);

    const productLicencePlates = products.map((product) => product.licencePlate);
    const pendingLicencePlates = pendingBillings.map((billing) => billing.licencePlate);
    const completedLicencePlates = completedBillings.map((billing) => billing.licencePlate);

    for (const status of billingStatus) {
      if (status === ProductBiliingStatus.PENDING) {
        licencePlates.push(...pendingLicencePlates);
      } else if (status === ProductBiliingStatus.COMPLETED) {
        const completedWithoutPending = _difference(completedLicencePlates, pendingLicencePlates);
        licencePlates.push(...completedWithoutPending);
      } else if (status === ProductBiliingStatus.NO_BILLING) {
        const noBillingLicencePlates = _difference(productLicencePlates, pendingLicencePlates, completedLicencePlates);
        licencePlates.push(...noBillingLicencePlates);
      }
    }

    where.licencePlate = { in: _uniq(licencePlates) };
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

  const {
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    members,
    organization,
    ...rest
  } = product;

  return {
    ...rest,
    members: members.map((member) => ({
      userId: member.userId,
      roles: member.roles,
    })),
  };
}
