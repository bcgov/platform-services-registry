import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import _forEach from 'lodash-es/forEach';
import _groupBy from 'lodash-es/groupBy';
import _map from 'lodash-es/map';
import { getProdClusterLicensePlates } from './common';

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}

export async function combinedRequests() {
  const prodClusterLicensePlates = await getProdClusterLicensePlates();

  const requests = await prisma.privateCloudRequest.findMany({
    where: { licencePlate: { in: prodClusterLicensePlates } },
    select: {
      created: true,
      type: true,
    },
    orderBy: {
      created: 'asc',
    },
  });

  const groupByDateKey = _groupBy(requests, (req) => createMonthKey(req.created));

  return _map(groupByDateKey, (dateRequests, date) => {
    const result = {
      date,
      'All requests': dateRequests.length,
      'Edit requests': 0,
      'Create requests': 0,
      'Delete requests': 0,
    };

    _forEach(dateRequests, (req) => {
      switch (req.type) {
        case $Enums.RequestType.CREATE:
          result['Create requests']++;
          break;
        case $Enums.RequestType.EDIT:
          result['Edit requests']++;
          break;
        case $Enums.RequestType.DELETE:
          result['Delete requests']++;
          break;
      }
    });

    return result;
  });
}
