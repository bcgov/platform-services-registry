import { RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import _isEqual from 'lodash-es/isEqual';

export type CombinedDataPoint = {
  date: string;
  'All requests': number;
  'Edit requests': number;
  'Create requests': number;
  'Delete requests': number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}

export async function combinedRequests() {
  const requests = await prisma.privateCloudRequest.findMany({
    select: {
      created: true,
    },

    orderBy: {
      created: 'asc',
    },
  });

  const editRequests = await prisma.privateCloudRequest.findMany({
    where: {
      type: RequestType.EDIT,
    },
    select: {
      created: true,
    },
    orderBy: {
      created: 'asc',
    },
  });

  const createRequests = await prisma.privateCloudRequest.findMany({
    where: {
      type: RequestType.CREATE,
    },
    select: {
      created: true,
    },
    orderBy: {
      created: 'asc',
    },
  });

  const deleteRequests = await prisma.privateCloudRequest.findMany({
    where: {
      type: RequestType.DELETE,
    },
    select: {
      created: true,
    },
    orderBy: {
      created: 'asc',
    },
  });

  const combinedRequestsData: CombinedDataPoint[] = [];

  const dateMap = new Map<string, number>();

  const combinedDates = [...requests, ...editRequests, ...createRequests, ...deleteRequests]
    .map((request) => request.created)
    .sort((a, b) => (a > b ? 1 : -1));

  combinedDates.forEach((d) => {
    const date = createMonthKey(d);
    const count = dateMap.get(date) || 0;
    dateMap.set(date, count + 1);
  });

  dateMap.forEach((count, date) => {
    const allCount = requests.filter((request) => createMonthKey(request.created) === date).length;
    const editCount = editRequests.filter((request) => createMonthKey(request.created) === date).length;
    const createCount = createRequests.filter((request) => createMonthKey(request.created) === date).length;
    const deleteCount = deleteRequests.filter((request) => createMonthKey(request.created) === date).length;

    combinedRequestsData.push({
      date,
      'All requests': allCount,
      'Edit requests': editCount,
      'Create requests': createCount,
      'Delete requests': deleteCount,
    });
  });

  return combinedRequestsData;
}
