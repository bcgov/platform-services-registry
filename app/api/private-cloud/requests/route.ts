import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import { privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const defaultPageSize = searchParams.get('defaultPageSize');
  const currentPage = searchParams.get('currentPage');
  const search = searchParams.get('search');
  const ministry = searchParams.get('ministry');
  const cluster = searchParams.get('cluster');
  const userEmail = searchParams.get('email');
  if (!defaultPageSize || !currentPage || !search) {
    return new NextResponse('Missing query parameters.', { status: 400 });
  }

  try {
    const data = await privateCloudRequestsPaginated(
      +defaultPageSize,
      +currentPage,
      search,
      ministry ?? '',
      cluster ?? '',
      userEmail ?? '',
    );

    if (!data) {
      return new NextResponse('No data found.', {
        status: 404,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
