import { bin } from 'd3-array';
import prisma from '@/core/prisma';

function convertMillisecondsToHours(milliseconds: number): number {
  return milliseconds / 3600000; // Convert ms to hours
}

export async function getRequestDecisionTime({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate: { in: licencePlatesList },
      ...dateFilter,
    },
    select: {
      createdAt: true,
      decisionDate: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const durations = requests
    .filter((req) => req.decisionDate)
    .map((req) => convertMillisecondsToHours(req.decisionDate!.getTime() - req.createdAt.getTime()));

  if (durations.length === 0) {
    return [];
  }

  const bins = bin().domain([0, 200]).thresholds(50)(durations);

  const data = bins.map((b) => {
    const lowerBound = b.x0 ?? 0;
    const upperBound = b.x1 ?? 0;

    return {
      time: `${lowerBound} hours - ${upperBound} hours`,
      Percentage: (b.length / durations.length) * 100,
    };
  });

  return data;
}
