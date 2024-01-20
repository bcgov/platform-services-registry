import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import createApiHandler from '@/core/api-handler';
import { combinedRequests, type CombinedDataPoint } from '@/analytics/private-cloud/requests';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data: CombinedDataPoint[] = await combinedRequests();

  // Convert the data to CSV
  const csv = stringify(data, {
    header: true,
    columns: ['date', 'All requests', 'Edit requests', 'Create requests', 'Delete requests'],
  });

  // Response for csv
  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=requests.csv',
    },
  });

  return response;
});
