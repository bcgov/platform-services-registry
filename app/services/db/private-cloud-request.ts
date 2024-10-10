import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { requestSorts } from '@/constants';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { models } from '@/services/db';
import { PrivateCloudRequestSearch } from '@/types/private-cloud';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';
import { getMatchingUserIds } from './user';

const defaultSortKey = 'updatedAt';
const defaultOrderBy = { [defaultSortKey]: Prisma.SortOrder.desc };

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
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: PrivateCloudRequestSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PrivateCloudRequestWhereInput;
}) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const decisionDatawhere: Prisma.PrivateCloudRequestedProjectWhereInput = {};

  const sortOption = requestSorts.find((sort) => sort.sortKey === sortKey);
  let orderBy!: Prisma.PrivateCloudRequestOrderByWithRelationInput;
  if (sortOption) {
    const order = { [sortKey]: Prisma.SortOrder[sortOrder] };
    orderBy = sortOption.inData ? { decisionData: order } : order;
  }

  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PrivateCloudRequestedProject'> = {
      contains: search,
      mode: 'insensitive',
    };

    decisionDatawhere.OR = [
      { projectOwnerId: { in: matchingUserIds } },
      { primaryTechnicalLeadId: { in: matchingUserIds } },
      { secondaryTechnicalLeadId: { in: matchingUserIds } },
      { name: productSearchcreteria },
      { description: productSearchcreteria },
      { licencePlate: productSearchcreteria },
    ];
  }

  if (licencePlate) {
    decisionDatawhere.licencePlate = licencePlate;
  }

  if (ministries && ministries.length > 0) {
    decisionDatawhere.ministry = { in: ministries };
  }

  if (clusters && clusters.length > 0) {
    decisionDatawhere.cluster = { in: clusters };
  }

  if (temporary && temporary.length === 1) {
    decisionDatawhere.isTest = temporary[0] === 'YES';
  }

  const matchingRequestedPrivateProjects = await prisma.privateCloudRequestedProject.findMany({
    where: decisionDatawhere,
    select: { id: true },
  });

  const where: Prisma.PrivateCloudRequestWhereInput = extraFilter ?? {};
  where.decisionDataId = { in: matchingRequestedPrivateProjects.map((proj) => proj.id) };

  if (types && types.length > 0) {
    where.type = { in: types };
  }

  if (status && status.length > 0) {
    where.decisionStatus = { in: status };
  }

  const { data: docs, totalCount } = await models.privateCloudRequest.list(
    {
      where,
      skip,
      take,
      orderBy: orderBy ?? defaultOrderBy,
      includeCount: true,
    },
    session,
  );

  return { docs, totalCount } as PrivateCloudRequestSearch;
}

export async function getLastClosedPrivateCloudRequest(licencePlate: string) {
  const previousRequest = await prisma.privateCloudRequest.findFirst({
    where: {
      licencePlate,
      active: false,
    },
    include: {
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
    orderBy: {
      updatedAt: Prisma.SortOrder.desc,
    },
  });

  return previousRequest;
}
