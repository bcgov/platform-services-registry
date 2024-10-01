import { Ministry, Provider, Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { Session } from 'next-auth';
import { requestSorts } from '@/constants';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { PublicCloudRequestDetail, PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';
import { getMatchingUserIds } from './users';

export const publicCloudRequestSimpleInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
};

export const publicCloudRequestDetailInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
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
    },
  },
};

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

  const [docs, totalCount] = await Promise.all([
    prisma.publicCloudRequest.findMany({
      where,
      skip,
      take,
      include: publicCloudRequestSimpleInclude,
      orderBy,
      session: session as never,
    }),
    prisma.publicCloudRequest.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}

export async function getPublicCloudRequest(session: Session, id?: string) {
  if (!id) return null;

  const request: PublicCloudRequestDetail | null = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
    },
    include: publicCloudRequestDetailInclude,
    session: session as never,
  });

  if (!request) {
    return null;
  }

  return request as PublicCloudRequestDetailDecorated;
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
