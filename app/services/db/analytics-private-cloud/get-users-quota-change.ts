import { User } from '@prisma/client';
import _uniqWith from 'lodash-es/uniqWith';
import prisma from '@/core/prisma';

export async function usersWithQuotaEditRequests({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const quotaChangedRequests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate: { in: licencePlatesList },
      ...dateFilter,
      isQuotaChanged: true,
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
  });

  let users = quotaChangedRequests
    .map((request) => {
      const { primaryTechnicalLead, secondaryTechnicalLead, projectOwner } = request.decisionData;
      return [primaryTechnicalLead, secondaryTechnicalLead, projectOwner];
    })
    .flat()
    .filter(Boolean);

  users = _uniqWith(users, (user1, user2) => user1?.id === user2?.id);

  return users as User[];
}
