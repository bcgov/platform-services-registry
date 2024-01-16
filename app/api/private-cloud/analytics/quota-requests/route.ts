import { NextResponse } from 'next/server';
import createApiHandler from '@/core/apiHandler';
import { quotaEditRequests } from '@/analytics/private-cloud/quotaChanges';
import { DecisionStatus } from '@prisma/client';

type DataPoint = {
  date: string;
  'All quota requests': number;
  'Approved quota requests': number;
  'Rejected quota requests': number;
};

const apiHandler = createApiHandler({
  roles: ['admin'],
});

export const GET = apiHandler(async ({ queryParams }) => {
  const getAllQuotaEditRequests = quotaEditRequests();
  const getApprovedQuotaEditRequests = quotaEditRequests(DecisionStatus.PROVISIONED);
  const getRejectedQuotaEditRequests = quotaEditRequests(DecisionStatus.REJECTED);

  const [allData, approvedData, rejectedData] = await Promise.all([
    getAllQuotaEditRequests,
    getApprovedQuotaEditRequests,
    getRejectedQuotaEditRequests,
  ]);

  const allDates = Array.from(
    new Set([...allData.map((d) => d.date), ...approvedData.map((d) => d.date), ...rejectedData.map((d) => d.date)]),
  );

  const data: DataPoint[] = allDates.map((date) => {
    return {
      date,
      'All quota requests': allData.find((d) => d.date === date)?.['Quota requests'] || 0,
      'Approved quota requests': approvedData.find((d) => d.date === date)?.['Quota requests'] || 0,
      'Rejected quota requests': rejectedData.find((d) => d.date === date)?.['Quota requests'] || 0,
    };
  });

  return NextResponse.json(data);
});
