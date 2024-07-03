import { RequestType } from '@prisma/client';
import _forEach from 'lodash-es/forEach';
import _groupBy from 'lodash-es/groupBy';
import _map from 'lodash-es/map';
import prisma from '@/core/prisma';

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}
export async function contactChangeRequests() {
  const requests = await prisma.publicCloudRequest.findRaw({
    filter: { type: RequestType.EDIT, 'changes.contactsChanged': { $eq: true } },
    options: {
      projection: { createdAt: true },
    },
  });

  const groupByDateKey = _groupBy(requests, (req: any) => createMonthKey(new Date(req.createdAt.$date)));
  return _map(groupByDateKey, (dateRequests, date) => {
    const result = {
      date,
      'Contact changes': dateRequests.length,
    };

    return result;
  });
}
