'use client';

import { z } from 'zod';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestView = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestView(({ pathParams, queryParams, session, router }) => {
  const [publicCloudState, publicCloudStateSnap] = usePublicProductState();
  const { id } = pathParams;

  if (!publicCloudStateSnap.currentRequest) {
    return null;
  }

  return <div>{publicCloudStateSnap.currentRequest.id}</div>;
});
