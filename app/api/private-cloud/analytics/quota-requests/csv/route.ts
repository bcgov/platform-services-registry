import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import createApiHandler from '@/core/apiHandler';
import { quotaEditRequests, type DataPoint } from '@/analytics/private-cloud/quotaChanges';

const apiHandler = createApiHandler({
  roles: ['admin'],
});

export const GET = apiHandler(async () => {
  const data: DataPoint[] = await quotaEditRequests();

  // Convert the data to CSV
  const csv = stringify(data, {
    header: true,
    columns: ['date', 'Quota requests'],
  });

  // Response for csv
  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=private-cloud-products.csv',
    },
  });

  return response;
});
