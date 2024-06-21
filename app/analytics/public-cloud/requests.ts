import { RequestType } from '@prisma/client';
import _isEqual from 'lodash/isEqual';
import prisma from '@/core/prisma';

interface CombinedDataPoint {
  date: string;
  'All requests': number;
  'Edit requests': number;
  'Create requests': number;
  'Delete requests': number;
}

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}

export async function combinedRequests() {
  const [requestsData, editRequestsData, createRequestsData, deleteRequestsData] = await Promise.all([
    prisma.publicCloudRequest.findMany({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        type: RequestType.EDIT,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        type: RequestType.CREATE,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        type: RequestType.DELETE,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ]);

  const combinedRequestsData: CombinedDataPoint[] = [];

  const dateMap = new Map<string, number>();

  const combinedDates = [...requestsData, ...editRequestsData, ...createRequestsData, ...deleteRequestsData]
    .map((request) => request.createdAt)
    .sort((a, b) => (a > b ? 1 : -1));

  combinedDates.forEach((d) => {
    const date = createMonthKey(d);
    const count = dateMap.get(date) || 0;
    dateMap.set(date, count + 1);
  });

  dateMap.forEach((count, date) => {
    const allCount = requestsData.filter((request) => createMonthKey(request.createdAt) === date).length;
    const editCount = editRequestsData.filter((request) => createMonthKey(request.createdAt) === date).length;
    const createCount = createRequestsData.filter((request) => createMonthKey(request.createdAt) === date).length;
    const deleteCount = deleteRequestsData.filter((request) => createMonthKey(request.createdAt) === date).length;

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
