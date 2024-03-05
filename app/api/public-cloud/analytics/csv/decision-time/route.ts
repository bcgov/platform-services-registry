import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import createApiHandler from '@/core/api-handler';
import { requestDecisionTime, DataPoint } from '@/analytics/private-cloud/request-decision-time';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data: DataPoint[] = await requestDecisionTime();

  // Convert the data to CSV
  const csv = stringify(data, {
    header: true,
    columns: ['time', 'Percentage'],
  });

  // Response for csv
  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=requst-decision-time.csv',
    },
  });

  return response;
});
