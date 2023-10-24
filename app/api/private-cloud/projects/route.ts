<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { privateCloudProjectsPaginated } from '@/paginatedQueries/private-cloud';
=======
import { NextRequest, NextResponse } from "next/server";
import { PrivateCloudProject } from "@prisma/client";
import prisma from "@/lib/prisma";
import { string, z } from "zod";
import { privateCloudProjectsPaginated } from "@/paginated-queries/private-cloud";
>>>>>>> 316df6e (created quereis)
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

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
    const data = await privateCloudProjectsPaginated(
      +defaultPageSize,
      +currentPage,
      search,
      ministry,
      cluster,
      userEmail,
    );

    if (!data) {
<<<<<<< HEAD
      return new NextResponse('No data found.', {
=======
      return new NextResponse("No data found.", {
>>>>>>> 316df6e (created quereis)
        status: 404,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
