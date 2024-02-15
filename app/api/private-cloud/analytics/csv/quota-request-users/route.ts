import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import createApiHandler from '@/core/api-handler';
import { usersWithQuotaEditRequests, type DataPoint } from '@/analytics/private-cloud/quotaChanges';
import { User } from '@prisma/client';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data: User[] = await usersWithQuotaEditRequests();

  // Convert the data to CSV
  const csv = stringify(
    data.map((user) => ({
      'First Name': user?.firstName,
      'Last Name': user?.lastName,
      Email: user?.email,
      Ministry: user?.ministry,
    })),
    {
      header: true,
      columns: ['First Name', 'Last Name', 'Email', 'Ministry'],
    },
  );

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
