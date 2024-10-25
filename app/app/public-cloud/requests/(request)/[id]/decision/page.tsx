'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductDecision = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductDecision(({ getPathParams, router }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const { id: requestId } = pathParams ?? {};

  useEffect(() => {
    if (requestId) router.push(`/public-cloud/requests/${requestId}/request`);
  }, [router, requestId]);

  return null;
});
