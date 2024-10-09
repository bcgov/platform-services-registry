import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { requestSorts } from '@/constants';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { publicCloudRequestModel } from '@/services/db';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';
import { getMatchingUserIds } from './users';

const defaultSortKey = 'updatedAt';
const defaultOrderBy = { [defaultSortKey]: Prisma.SortOrder.desc };

export async function searchPublicCloudRequests({
  session,
  skip,
  take,
  page,
  pageSize,
  licencePlate,
  ministries,
  providers,
  types,
  status,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: PublicCloudRequestSearchBody & {
  session: Session;
  skip?: number;
  take?: number;
  extraFilter?: Prisma.PublicCloudRequestWhereInput;
}) {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const decisionDatawhere: Prisma.PublicCloudRequestedProjectWhereInput = {};

  const sortOption = requestSorts.find((sort) => sort.sortKey === sortKey);
  let orderBy!: Prisma.PublicCloudRequestOrderByWithRelationInput;
  if (sortOption) {
    const order = { [sortKey]: Prisma.SortOrder[sortOrder] };
    orderBy = sortOption.inData ? { decisionData: order } : order;
  }
  if (search === '*') search = '';

  if (search) {
    const matchingUserIds = await getMatchingUserIds(search);
    const productSearchcreteria: Prisma.StringFilter<'PublicCloudRequestedProject'> = {
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

  if (providers && providers.length > 0) {
    decisionDatawhere.provider = { in: providers };
  }

  const matchingRequestedPublicProjects = await prisma.publicCloudRequestedProject.findMany({
    where: decisionDatawhere,
    select: { id: true },
  });

  const where: Prisma.PublicCloudRequestWhereInput = extraFilter ?? {};
  where.decisionDataId = { in: matchingRequestedPublicProjects.map((proj) => proj.id) };

  if (types && types.length > 0) {
    where.type = { in: types };
  }

  if (status && status.length > 0) {
    where.decisionStatus = { in: status };
  }

  const { data: docs, totalCount } = await publicCloudRequestModel.list(
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

export async function getLastClosedPublicCloudRequest(licencePlate: string) {
  const previousRequest = await prisma.publicCloudRequest.findFirst({
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
