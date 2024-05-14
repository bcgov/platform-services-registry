'use client';

import { z } from 'zod';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestSummary = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestSummary(({ pathParams, queryParams, session, router }) => {
  const [publicCloudState, publicCloudStateSnap] = usePublicProductState();
  const { id } = pathParams;

  return <div>Summary</div>;
});
