'use client';

import { Alert } from '@mantine/core';
import { DecisionStatus, RequestType } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { z } from 'zod';
import ProductComparison from '@/components/ProductComparison';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';
import { DiffChange } from '@/utils/diff';

const pathParamSchema = z.object({
  id: z.string(),
});

const Layout = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({}) => {
  const [publicCloudState, publicCloudStateSnap] = usePublicProductState();

  return (
    <div>
      {publicCloudStateSnap.currentRequest?.decisionStatus === DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is currently under admin review.
        </Alert>
      )}

      <div className="mb-2"></div>

      {publicCloudStateSnap.currentRequest?.type !== RequestType.CREATE && (
        <div className="py-2">
          <ProductComparison data={publicCloudStateSnap.dataChangeOriginalRequest?.changes as DiffChange[]} />
        </div>
      )}
    </div>
  );
});
