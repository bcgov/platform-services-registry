import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { privateCloudProjectsPaginated } from '@/queries/paginated/private-cloud';
import { parse, stringify } from 'csv-stringify/sync';
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const defaultPageSize = searchParams.get('defaultPageSize');
  const currentPage = searchParams.get('currentPage');
  const search = searchParams.get('search') || '';
  const ministry = searchParams.get('ministry');
  const cluster = searchParams.get('cluster');
  const userEmail = searchParams.get('email');

  if (!defaultPageSize || !currentPage || !search) {
    return new NextResponse('Missing query parameters.', { status: 400 });
  }

  try {
    const data = await privateCloudProjectsPaginated(
      +defaultPageSize,
      +currentPage,
      search,
      ministry,
      cluster,
      userEmail,
    );

    if (!data) {
      return new NextResponse('No data found for the provided query', {
        status: 404,
      });
    }

    // Convert the data to CSV
    const csv = stringify(data, {
      header: true,
      columns: [], //insert fields here
    });
    // Response for csv
    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="projects.csv"',
      },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
