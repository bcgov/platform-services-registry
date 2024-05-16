import { $Enums, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import { getMatchingUserIds } from './users';

export type PrivateCloudRequestGetPayload = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}> &
  PrivateCloudRequestDecorate;

const defaultSortKey = 'updatedAt';

export async function searchPrivateCloudRequests({
  session,
  skip,
  take,
  licencePlate,
  ministry,
  cluster,
  search,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: {
  session: Session;
  skip: number;
  take: number;
  licencePlate?: string;
  ministry?: string;
  cluster?: string;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PrivateCloudRequestWhereInput;
}) {
  const decisionDatawhere: Prisma.PrivateCloudRequestedProjectWhereInput = {};

  const orderBy =
    sortKey === 'updatedAt'
      ? { updatedAt: Prisma.SortOrder[sortOrder] }
      : { requestData: { [sortKey]: Prisma.SortOrder[sortOrder] } };

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

  if (ministry) {
    decisionDatawhere.ministry = ministry as $Enums.Ministry;
  }

  if (cluster) {
    decisionDatawhere.cluster = cluster as $Enums.Cluster;
  }

  const matchingRequestedPrivateProjects = await prisma.privateCloudRequestedProject.findMany({
    where: decisionDatawhere,
    select: { id: true },
  });

  const where: Prisma.PrivateCloudRequestWhereInput = extraFilter ?? {};
  where.requestDataId = { in: matchingRequestedPrivateProjects.map((proj) => proj.id) };

  const [docs, totalCount] = await Promise.all([
    prisma.privateCloudRequest.findMany({
      where,
      skip,
      take,
      include: {
        originalData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
        requestData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
        decisionData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
      },
      orderBy,
      session: session as never,
    }),
    prisma.privateCloudRequest.count({
      where,
      session: session as never,
    }),
  ]);

  return { docs, totalCount };
}

export type PrivateCloudRequestSearchedItemPayload = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}> &
  PrivateCloudRequestDecorate;

export type PrivateCloudRequestSearchPayload = {
  docs: PrivateCloudRequestSearchedItemPayload[];
  totalCount: number;
};

export async function getPrivateCloudRequest(session: Session, id?: string) {
  if (!id) return null;

  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      requestData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
    session: session as never,
  });

  if (!request) {
    return null;
  }

  return request as PrivateCloudRequestGetPayload;
}
