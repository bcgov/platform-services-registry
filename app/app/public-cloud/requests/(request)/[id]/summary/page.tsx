'use client';

import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { z } from 'zod';
import ProductComparison from '@/components/ProductComparison';
import createClientPage from '@/core/client-page';
import { ProductDataChanges } from '@/helpers/product';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const Layout = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({ pathParams, queryParams, session, router, children }) => {
  const [publicCloudState, publicCloudStateSnap] = usePublicProductState();
  const { id } = pathParams;

  return (
    <div>
      {publicCloudStateSnap.currentRequest?.decisionStatus === $Enums.DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is currently under admin review.
        </Alert>
      )}

      <div className="mb-2"></div>

      {publicCloudStateSnap.currentRequest?.type !== $Enums.RequestType.CREATE && (
        <div className="py-2">
          <ProductComparison data={publicCloudStateSnap.dataChangeOriginalRequest?.changes as ProductDataChanges} />
        </div>
      )}
    </div>
  );
});
