'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import ProductComparison from '@/components/ProductComparison';
import createClientPage from '@/core/client-page';
import { comparePrivateProductData, ProductChange } from '@/helpers/product';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestSummaryRequestDecision = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestSummaryRequestDecision(({ pathParams, queryParams, session, router }) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();
  const [diff, setDiff] = useState<ProductChange>();
  const { id } = pathParams;

  useEffect(() => {
    if (privateCloudStateSnap.currentRequest) {
      const changes = comparePrivateProductData(
        privateCloudStateSnap.currentRequest.requestData,
        privateCloudStateSnap.currentRequest.decisionData,
      );

      setDiff(changes);
    }
  }, [privateCloudStateSnap?.currentRequest]);

  if (!diff) return null;

  return (
    <div className="py-1">
      <ProductComparison data={diff} />
    </div>
  );
});
