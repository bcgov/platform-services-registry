import prisma from '@/core/prisma';
import { DecisionStatus } from '@/prisma/types';
import { dateToShortDateString } from '@/utils/js/date';

interface QuotaChanges {
  [key: string]: {
    all: number;
    [DecisionStatus.APPROVED]: number;
    [DecisionStatus.REJECTED]: number;
  };
}

export async function getQuotaChangeRequests({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const quotaChangedRequests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate: { in: licencePlatesList },
      isQuotaChanged: true,
      decisionStatus: { notIn: [DecisionStatus.PENDING] },
      ...dateFilter,
    },
    select: {
      createdAt: true,
      decisionStatus: true,
    },
  });

  const result: QuotaChanges = {};

  for (const request of quotaChangedRequests) {
    const date = dateToShortDateString(request.createdAt);
    if (!result[date]) {
      result[date] = { all: 0, [DecisionStatus.APPROVED]: 0, [DecisionStatus.REJECTED]: 0 };
    }

    result[date].all++;

    switch (request.decisionStatus) {
      case DecisionStatus.APPROVED:
      case DecisionStatus.AUTO_APPROVED:
      case DecisionStatus.PROVISIONED:
        result[date][DecisionStatus.APPROVED]++;
        break;
      case DecisionStatus.REJECTED:
        result[date][DecisionStatus.REJECTED]++;
        break;
    }
  }

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    'All quota requests': counts.all,
    'Approved quota requests': counts[DecisionStatus.APPROVED],
    'Rejected quota requests': counts[DecisionStatus.REJECTED],
  }));

  return data;
}
