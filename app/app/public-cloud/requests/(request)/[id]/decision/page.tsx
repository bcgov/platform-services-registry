'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import createClientPage from '@/core/client-page';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductDecision = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductDecision(({ pathParams, queryParams, session, router }) => {
  const { id: requestId } = pathParams;

  useEffect(() => {
    router.push(`/public-cloud/requests/${requestId}/request`);
  }, [router, requestId]);

  return null;
});
