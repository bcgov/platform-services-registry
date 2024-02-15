import { PrivateCloudRequest } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';

interface QuotaChanges {
  [key: string]: number;
}

export type DataPoint = {
  date: string;
  'All quota requests': number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function quotaEditRequests() {
  const quotaChangedRequests: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany({
    where: {
      isQuotaChanged: true,
    },
  });

  const result: QuotaChanges = {};

  for (const request of quotaChangedRequests) {
    const date = parseDate(request.created);
    if (!result[date]) {
      result[date] = 0;
    }
    result[date]++;
  }

  const data = Object.entries(result).map(([date, count]) => ({
    date,
    'All quota requests': count,
  }));

  return data;
}
