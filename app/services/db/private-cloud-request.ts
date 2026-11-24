import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { requestSorts } from '@/constants';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { DecisionStatus, Prisma, RequestType } from '@/prisma/client';
import { models, publicCloudRequestDetailInclude } from '@/services/db';
import { PrivateCloudRequestSearch } from '@/types/private-cloud';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';
import { getRequestStatusFilter } from './request-status-filter';
import { getMatchingUserIds } from './user';

const defaultSortKey = 'updatedAt';
const defaultOrderBy = { [defaultSortKey]: Prisma.SortOrder.desc };

async function buildDecisionDataSearchFilter({
  licencePlate,
  ministries,
  clusters,
  temporary,
  search,
}: PrivateCloudRequestSearchBody): Promise<Prisma.PrivateCloudRequestDataWhereInput> {
  const where: Prisma.PrivateCloudRequestDataWhereInput = {};

  if (search && search !== '*') {
    const matchingUserIds = await getMatchingUserIds(search);

    const searchCriteria: Prisma.StringFilter<'PrivateCloudRequestData'> = {
      contains: search,
      mode: 'insensitive',
    };

    where.OR = [
      { projectOwnerId: { in: matchingUserIds } },
      { primaryTechnicalLeadId: { in: matchingUserIds } },
      { secondaryTechnicalLeadId: { in: matchingUserIds } },
      { name: searchCriteria },
      { description: searchCriteria },
      { licencePlate: searchCriteria },
    ];
  }

  if (licencePlate) {
    where.licencePlate = licencePlate;
  }

  if (ministries?.length) {
    const organizations = await prisma.organization.findMany({
      where: { code: { in: ministries } },
      select: { id: true },
    });

    where.organizationId = {
      in: organizations.map((org) => org.id),
    };
  }

  if (clusters?.length) {
    where.cluster = { in: clusters };
  }

  if (temporary?.length === 1) {
    where.isTest = temporary[0] === 'YES';
  }

  return where;
}

function appendRequestFilter(
  where: Prisma.PrivateCloudRequestWhereInput,
  filter: Prisma.PrivateCloudRequestWhereInput,
) {
  const existing = where.AND;

  where.AND = [...(existing ? (Array.isArray(existing) ? existing : [existing]) : []), filter];
}

async function buildPrivateCloudRequestSearchQuery({
  licencePlate,
  ministries,
  clusters,
  types,
  status,
  temporary,
  quotaChange,
  quotaIncrease,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: PrivateCloudRequestSearchBody & {
  extraFilter?: Prisma.PrivateCloudRequestWhereInput;
}) {
  const sortOption = requestSorts.find((sort) => sort.sortKey === sortKey);

  let orderBy: Prisma.PrivateCloudRequestOrderByWithRelationInput = defaultOrderBy;

  if (sortOption) {
    const order = { [sortKey]: Prisma.SortOrder[sortOrder] };

    orderBy = sortOption.inData ? { decisionData: order } : order;
  }

  const decisionDatawhere = await buildDecisionDataSearchFilter({
    licencePlate,
    ministries,
    clusters,
    temporary,
    search,
  });

  const where: Prisma.PrivateCloudRequestWhereInput = {
    ...extraFilter,
  };

  if (Object.keys(decisionDatawhere).length > 0) {
    appendRequestFilter(where, {
      decisionData: {
        is: decisionDatawhere,
      },
    });
  }

  if (types?.length) {
    where.type = { in: types };
  }

  if (quotaChange) {
    where.isQuotaChanged = true;
  }

  if (quotaIncrease) {
    where.changes = {
      is: {
        quotasIncrease: true,
      },
    };
  }

  if (status?.length) {
    appendRequestFilter(where, getRequestStatusFilter<Prisma.PrivateCloudRequestWhereInput>(status));
  }

  return { where, orderBy };
}

export async function searchPrivateCloudRequests({
  session,
  skip,
  take,
  page,
  pageSize,
  licencePlate,
  ministries,
  clusters,
  types,
  status,
  temporary,
  quotaChange,
  quotaIncrease,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
  forExport = false,
}: PrivateCloudRequestSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PrivateCloudRequestWhereInput;
  forExport?: boolean;
}) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }
  const { where, orderBy } = await buildPrivateCloudRequestSearchQuery({
    licencePlate,
    ministries,
    clusters,
    types,
    status,
    temporary,
    quotaChange,
    quotaIncrease,
    search,
    sortKey,
    sortOrder,
    extraFilter,
  });

  const { data: docs, totalCount } = await models.privateCloudRequest.list(
    {
      where,
      skip,
      take,
      orderBy,
      includeCount: !forExport,
      ...(forExport && {
        select: {
          licencePlate: true,
          type: true,
          decisionStatus: true,
          createdAt: true,
          updatedAt: true,
          isQuotaChanged: true,
        },
      }),
    },
    session,
  );

  return { docs, totalCount } as PrivateCloudRequestSearch;
}

export async function searchPrivateCloudRequestsForServiceAccount({
  page = 1,
  pageSize = 100,
  ...filters
}: PrivateCloudRequestSearchBody) {
  const { skip, take } = parsePaginationParams(page, pageSize, 10);

  const { where, orderBy } = await buildPrivateCloudRequestSearchQuery(filters);

  const deterministicOrderBy: Prisma.PrivateCloudRequestOrderByWithRelationInput[] = [
    orderBy,
    { id: Prisma.SortOrder.asc },
  ];

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudRequest.findMany({
      where,
      skip,
      take,
      orderBy: deterministicOrderBy,
      select: {
        id: true,
        licencePlate: true,
        type: true,
        decisionStatus: true,
        isQuotaChanged: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.privateCloudRequest.count({ where }),
  ]);

  return { docs, totalCount };
}

export async function getLastEffectivePrivateCloudRequest(licencePlate: string) {
  const previousRequest = await prisma.privateCloudRequest.findFirst({
    where: {
      licencePlate,
      active: false,
      decisionStatus: {
        notIn: [DecisionStatus.CANCELLED, DecisionStatus.REJECTED],
      },
    },
    include: {
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          organization: true,
        },
      },
    },
    orderBy: {
      updatedAt: Prisma.SortOrder.desc,
    },
  });

  return previousRequest;
}

export async function getMostRecentPublicCloudRequest(licencePlate: string) {
  const request = await prisma.publicCloudRequest.findFirst({
    where: { licencePlate, OR: [{ type: RequestType.CREATE, active: true }, { active: false }] },
    include: publicCloudRequestDetailInclude,
    orderBy: { createdAt: Prisma.SortOrder.desc },
  });

  return request;
}
