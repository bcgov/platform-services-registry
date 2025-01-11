import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { BillingSearchBody } from '@/validation-schemas/billing';
const defaultSortKey = 'createdAt';

export type SearchBilling = Prisma.BillingGetPayload<{
  select: {
    id: true;
    accountCoding: true;
    licencePlate: true;
    signed: true;
    approved: true;
    createdAt: true;
    approvedBy: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
      };
    };
    expenseAuthority: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
      };
    };
    signedBy: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
      };
    };
  };
}>;

export async function searchBilling({
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
}): Promise<{ data: SearchBilling[]; totalCount: number }> {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const filters: Prisma.BillingWhereInput = {};

  if (search.trim()) {
    filters.OR = [
      { expenseAuthority: { firstName: { contains: search, mode: 'insensitive' } } },
      { expenseAuthority: { firstName: { contains: search, mode: 'insensitive' } } },
      { expenseAuthority: { lastName: { contains: search, mode: 'insensitive' } } },
      { signedBy: { email: { contains: search, mode: 'insensitive' } } },
      { signedBy: { lastName: { contains: search, mode: 'insensitive' } } },
      { signedBy: { email: { contains: search, mode: 'insensitive' } } },
      { approvedBy: { firstName: { contains: search, mode: 'insensitive' } } },
      { approvedBy: { lastName: { contains: search, mode: 'insensitive' } } },
      { approvedBy: { email: { contains: search, mode: 'insensitive' } } },
      { licencePlate: { contains: search, mode: 'insensitive' } },
    ];
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
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
          },
        },
        expenseAuthority: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
          },
        },
        signedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
          },
        },
      },
    }),
    prisma.billing.count({ where: filters }),
  ]);
  return { data, totalCount };
}
