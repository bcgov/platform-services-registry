'use client';

import { z } from 'zod';
import createClientPage from '@/core/client-page';

const queryParamSchema = z.object({
  includeInactive: z.preprocess((v) => v === 'true', z.boolean()),
});

const privateCloudRequests = createClientPage({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export default privateCloudRequests(({ pathParams, queryParams, session }) => {
  return <div>privateCloudRequests</div>;
});
