import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { combinedRequests, type CombinedDataPoint } from '@/analytics/private-cloud/requests';

export const GET = async () => {
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
      'Content-Disposition': 'attachment; filename=requests-over-time.csv',
    },
  });

  return response;
};
