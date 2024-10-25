'use client';

import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestView = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestView(({}) => {
  const [publicCloudState, publicCloudStateSnap] = usePublicProductState();

  if (!publicCloudStateSnap.currentRequest) {
    return null;
  }

  return <div>{publicCloudStateSnap.currentRequest.id}</div>;
});
