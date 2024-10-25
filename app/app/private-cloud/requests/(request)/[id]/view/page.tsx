'use client';

import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestView = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestView(({}) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();

  if (!privateCloudStateSnap.currentRequest) {
    return null;
  }

  return <div>{privateCloudStateSnap.currentRequest.id}</div>;
});
