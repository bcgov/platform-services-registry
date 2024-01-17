import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import createApiHandler from '@/core/apiHandler';
import { combinedQuotaEditRequests, type CombinedDataPoint } from '@/analytics/private-cloud/quotaChanges';

const apiHandler = createApiHandler({
  roles: ['admin'],
});

export const GET = apiHandler(async () => {
  const data: CombinedDataPoint[] = await combinedQuotaEditRequests();

  // Convert the data to CSV
  const csv = stringify(data, {
    header: true,
    columns: ['date', 'All quota requests', 'Approved quota requests', 'Rejected quota requests'],
  });

  // Response for csv
  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=quota-requests.csv',
    },
  });

  return response;
});
