import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { BillingSearchResponseDataItem } from '@/types/billing';
import { BillingSearchBody } from '@/validation-schemas/billing';

const defaultSortKey = 'createdAt';

export async function searchBilling({
  billings = [],
  search = '',
  page,
  skip,
  take,
  pageSize,
  sortOrder = Prisma.SortOrder.desc,
  sortKey = defaultSortKey,
}: BillingSearchBody & {
  skip?: number;
  take?: number;
}): Promise<{ data: BillingSearchResponseDataItem[]; totalCount: number }> {
  const isBillingSearch = billings.length > 0;
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const filters: Prisma.BillingWhereInput = {};

  const billingSearchFilter: Prisma.StringFilter<'Billing'> = {
    contains: search,
    mode: Prisma.QueryMode.insensitive,
  };

  const userSearchFilter: Prisma.StringFilter<'User'> = {
    contains: search,
    mode: Prisma.QueryMode.insensitive,
  };

  if (search.trim()) {
    filters.OR = [
      { expenseAuthority: { firstName: userSearchFilter } },
      { expenseAuthority: { firstName: userSearchFilter } },
      { expenseAuthority: { lastName: userSearchFilter } },
      { signedBy: { email: userSearchFilter } },
      { signedBy: { lastName: userSearchFilter } },
      { signedBy: { email: userSearchFilter } },
      { approvedBy: { firstName: userSearchFilter } },
      { approvedBy: { lastName: userSearchFilter } },
      { approvedBy: { email: userSearchFilter } },
      { licencePlate: billingSearchFilter },
      { accountCoding: billingSearchFilter },
    ];
  }

  if (isBillingSearch) {
    const conditions: Prisma.BillingWhereInput[] = [];

    if (billings.includes('approved')) {
      conditions.push({ approved: false });
    }

    if (billings.includes('signed')) {
      conditions.push({ signed: false });
    }

    if (conditions.length > 0) {
      filters.OR = conditions;
    }
  }

  const orderBy = { [sortKey]: sortOrder };

  const [data, totalCount] = await Promise.all([
    prisma.billing.findMany({
      skip,
      take,
      where: filters,
      orderBy,
      select: {
        id: true,
        accountCoding: true,
        licencePlate: true,
        signed: true,
        approved: true,
        createdAt: true,
        signedAt: true,
        approvedAt: true,
        updatedAt: true,
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
            ministry: true,
          },
        },
        expenseAuthority: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
            ministry: true,
          },
        },
        signedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
            ministry: true,
          },
        },
      },
    }),
    prisma.billing.count({ where: filters }),
  ]);

  return { data, totalCount };
}
