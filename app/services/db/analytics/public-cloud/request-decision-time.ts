import prisma from '@/core/prisma';
import { Prisma } from '@/prisma/client';
import { getChartDataForDecisionTime } from '../shared/request-decision-time';

export async function getRequestDecisionTime({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const requests = await prisma.publicCloudRequest.findMany({
    where: {
      licencePlate: { in: licencePlatesList },
      // Exclude auto approved requests
      OR: [
        {
          decisionMakerEmail: {
            not: null,
          },
        },
        {
          decisionMakerEmail: {
            not: '',
          },
        },
      ],
      ...dateFilter,
    },
    select: {
      createdAt: true,
      decisionDate: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.asc,
    },
  });

  const result = await getChartDataForDecisionTime(requests);
  return result;
}
