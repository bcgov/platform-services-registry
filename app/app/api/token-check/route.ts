import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { validateAllMetricsReaderTokens } from '@/services/k8s/metrics/core';

export const POST = createApiHandler({})(async () => {
  const result = await validateAllMetricsReaderTokens();
  return NextResponse.json(result);
});
