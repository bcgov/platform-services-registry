import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';

export function CsvResponse<T extends Record<string, any>>(data: T[], filename: string) {
  const csv = stringify(data, {
    header: true,
    columns: data.length > 0 ? Object.keys(data[0]) : [],
  });

  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `'attachment; filename=${filename}'`,
    },
  });

  return response;
}
