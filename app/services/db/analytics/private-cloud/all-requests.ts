import _forEach from 'lodash-es/forEach';
import _groupBy from 'lodash-es/groupBy';
import _map from 'lodash-es/map';
import prisma from '@/core/prisma';
import { RequestType } from '@/prisma/client';
import { dateToShortDateString } from '@/utils/js/date';

export async function getAllRequests({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const requests = await prisma.privateCloudRequest.findMany({
    where: { licencePlate: { in: licencePlatesList }, ...dateFilter },
    select: {
      createdAt: true,
      type: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const groupByDateKey = _groupBy(requests, (req) => dateToShortDateString(req.createdAt));

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
        case RequestType.CREATE:
          result['Create requests']++;
          break;
        case RequestType.EDIT:
          result['Edit requests']++;
          break;
        case RequestType.DELETE:
          result['Delete requests']++;
          break;
      }
    });

    return result;
  });
}
