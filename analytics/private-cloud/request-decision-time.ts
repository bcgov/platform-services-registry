import prisma from '@/core/prisma';
import _isEqual from 'lodash-es/isEqual';
import { bin, extent } from 'd3-array';
import { getProdClusterLicensePlates } from './common';

function convertMillisecondsToHours(milliseconds: number): number {
  return milliseconds / 3600000; // 1000 milliseconds in a second and 3600 seconds in an hour
}

export async function requestDecisionTime() {
  const prodClusterLicensePlates = await getProdClusterLicensePlates();
  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate: { in: prodClusterLicensePlates },
    },
    select: {
      created: true,
      decisionDate: true,
    },
    orderBy: {
      created: 'asc',
    },
  });

  const durations: number[] = [];

  requests.forEach((request) => {
    if (request.decisionDate) {
      const duration = request.decisionDate.getTime() - request.created.getTime();
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
