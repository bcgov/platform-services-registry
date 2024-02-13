import { PrivateCloudRequestedProject, PrivateCloudRequest, DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';

const defaultQuota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

interface QuotaChanges {
  [key: string]: number;
}

export type DataPoint = {
  date: string;
  'Quota requests': number;
};

export type CombinedDataPoint = {
  date: string;
  'All quota requests': number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function combinedQuotaEditRequests() {
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
