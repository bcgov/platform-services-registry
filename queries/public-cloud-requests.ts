import { $Enums, Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudRequestDecorate } from '@/types/doc-decorate';
import { getMatchingUserIds } from './users';

export type PublicCloudRequestGetPayload = Prisma.PublicCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}> &
  PublicCloudRequestDecorate;

const defaultSortKey = 'updatedAt';

export async function searchPublicCloudRequests({
  session,
  skip,
  take,
  licencePlate,
  ministry,
  provider,
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
  provider?: string;
  search?: string;
  sortKey?: string;
  sortOrder?: Prisma.SortOrder;
  extraFilter?: Prisma.PublicCloudRequestWhereInput;
}) {
  const decisionDatawhere: Prisma.PublicCloudRequestedProjectWhereInput = {};

  const orderBy =
    sortKey === 'updatedAt'
      ? { updatedAt: Prisma.SortOrder[sortOrder] }
      : { requestData: { [sortKey]: Prisma.SortOrder[sortOrder] } };

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

  if (ministry) {
    decisionDatawhere.ministry = ministry as $Enums.Ministry;
  }

  if (provider) {
    decisionDatawhere.provider = provider as $Enums.Provider;
  }

  const matchingRequestedPublicProjects = await prisma.publicCloudRequestedProject.findMany({
    where: decisionDatawhere,
    select: { id: true },
  });

  const where: Prisma.PublicCloudRequestWhereInput = extraFilter ?? {};
  where.requestDataId = { in: matchingRequestedPublicProjects.map((proj) => proj.id) };

  const [docs, totalCount] = await Promise.all([
    prisma.publicCloudRequest.findMany({
      where,
      skip,
      take,
      include: {
        originalData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
            expenseAuthority: true,
          },
        },
        requestData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
            expenseAuthority: true,
          },
        },
        decisionData: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
            expenseAuthority: true,
          },
        },
      },
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

export type PublicCloudRequestSearchedItemPayload = Prisma.PublicCloudRequestGetPayload<{
  include: {
    originalData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    requestData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}> &
  PublicCloudRequestDecorate;

export type PublicCloudRequestSearchPayload = {
  docs: PublicCloudRequestSearchedItemPayload[];
  totalCount: number;
};

export async function getPublicCloudRequest(session: Session, id?: string) {
  if (!id) return null;

  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      requestData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
    session: session as never,
  });

  if (!request) {
    return null;
  }

  return request as PublicCloudRequestGetPayload;
}
