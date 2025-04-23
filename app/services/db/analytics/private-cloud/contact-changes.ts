import _groupBy from 'lodash-es/groupBy';
import _map from 'lodash-es/map';
import prisma from '@/core/prisma';
import { RequestType } from '@/prisma/client';
import { dateToShortDateString } from '@/utils/js/date';

export async function getContactChangeRequests({
  licencePlatesList,
  dateFilter = {},
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
}) {
  const mongoDateFilter: Record<string, any> = {};

  if (dateFilter.createdAt?.gte && dateFilter.createdAt?.lte) {
    mongoDateFilter.createdAt = {
      $gte: { $date: dateFilter.createdAt.gte.toISOString() },
      $lte: { $date: dateFilter.createdAt.lte.toISOString() },
    };
  }

  const filter = {
    type: RequestType.EDIT,
    'changes.contactsChanged': true,
    licencePlate: { $in: licencePlatesList },
    ...mongoDateFilter,
  };

  const requests = await prisma.privateCloudRequest.findRaw({
    filter,
    options: { projection: { createdAt: true } },
  });

  const grouped = _groupBy(requests, (req: any) => {
    const createdAtValue = req.createdAt?.$date ? req.createdAt.$date : req.createdAt;
    return dateToShortDateString(new Date(createdAtValue));
  });

  return _map(grouped, (dateRequests, date) => ({
    date,
    'Contact changes': dateRequests.length,
  }));
}
