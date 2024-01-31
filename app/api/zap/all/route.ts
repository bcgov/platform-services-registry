import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import createApiHandler from '@/core/api-handler';

const apiHandler = createApiHandler({
  roles: ['admin'],
});
export const POST = apiHandler(async ({ pathParams, queryParams, body, session }) => {
  const results = await prisma.privateCloudProjectZapResult.findMany({
    select: { id: true, licencePlate: true, cluster: true, host: true, json: true, scannedAt: true },
    session: session as never,
  });

  return NextResponse.json(results);
});
