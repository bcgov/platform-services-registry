'use client';

import { z } from 'zod';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestSummary = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestSummary(({ pathParams, queryParams, session, router }) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();
  const { id } = pathParams;

  return <div>Summary</div>;
});
