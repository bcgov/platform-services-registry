import { NextResponse } from 'next/server';
import createApiHandler from '@/core/apiHandler';
import { quotaEditRequests } from '@/analytics/private-cloud/quotaChanges';

const apiHandler = createApiHandler({
  roles: ['admin'],
});

export const GET = apiHandler(async () => {
  const data = await quotaEditRequests();

  return NextResponse.json(data);
});
