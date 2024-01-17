import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { numberOfProductsOverTime, DataPoint } from '@/analytics/private-cloud/products';

export const GET = async () => {
  const data: DataPoint[] = await numberOfProductsOverTime();

  // Convert the data to CSV
  const csv = stringify(data, {
    header: true,
    columns: ['date', 'Products'],
  });

  // Response for csv
  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=products-over-time.csv',
    },
  });

  return response;
};
