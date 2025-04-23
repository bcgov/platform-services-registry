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
  const filter = {
    type: RequestType.EDIT,
    'changes.contactsChanged': { $eq: true },
    licencePlate: { $in: licencePlatesList },
    ...dateFilter,
  };

  const requests = await prisma.publicCloudRequest.findRaw({
    filter,
    options: { projection: { createdAt: true } },
  });

  const grouped = _groupBy(requests, (req: any) => {
    const createdAtValue = req.createdAt && req.createdAt.$date ? req.createdAt.$date : req.createdAt;
    return dateToShortDateString(new Date(createdAtValue));
  });

  const results = _map(grouped, (dateRequests, date) => ({
    date,
    'Contact changes': dateRequests.length,
  }));

  return results;
}
