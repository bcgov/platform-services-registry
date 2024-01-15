import { NextResponse } from 'next/server';
import createApiHandler from '@/core/apiHandler';
import { quotaEditRequests } from '@/analytics/private-cloud/quotaChanges';
import { string, z } from 'zod';
import { DecisionStatus } from '@prisma/client';

const GetParamsSchema = z.object({
  decisionStatus: z.nativeEnum(DecisionStatus).optional(),
});

const apiHandler = createApiHandler({
  roles: ['admin'],
  validations: {
    queryParams: GetParamsSchema,
  },
});

export const GET = apiHandler(async () => {
  const data = await quotaEditRequests();

  return NextResponse.json(data);
});
