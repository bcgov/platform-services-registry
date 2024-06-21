import { bin } from 'd3-array';
import _isEqual from 'lodash/isEqual';
import prisma from '@/core/prisma';

function convertMillisecondsToHours(milliseconds: number): number {
  return milliseconds / 3600000; // 1000 milliseconds in a second and 3600 seconds in an hour
}

export async function requestDecisionTime() {
  const requests = await prisma.publicCloudRequest.findMany({
    select: {
      createdAt: true,
      decisionDate: true,
    },

    orderBy: {
      createdAt: 'asc',
    },
  });

  const durations: number[] = [];

  requests.forEach((request) => {
    if (request.decisionDate) {
      const duration = request.decisionDate.getTime() - request.createdAt.getTime();
      const durationInHours = convertMillisecondsToHours(duration);

      durations.push(durationInHours);
    }
  });

  const bins = bin().domain([0, 200]).thresholds(50)(durations);

  const data = bins.map((b) => {
    return {
      time: `${b.x0} hours - ${b.x1} hours`,
      Percentage: (b.length / durations.length) * 100,
    };
  });

  return data;
}
