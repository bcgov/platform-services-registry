'use client';

import { Alert } from '@mantine/core';
import { DecisionStatus, RequestType } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { z } from 'zod';
import ProductComparison from '@/components/ProductComparison';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';
import { DiffChange } from '@/utils/js';

const pathParamSchema = z.object({
  id: z.string(),
});

const Layout = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({}) => {
  const [, snap] = usePublicProductState();

  return (
    <div>
      {snap.currentRequest?.decisionStatus === DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is currently under admin review.
        </Alert>
      )}

      <div className="mb-2"></div>

      {snap.currentRequest?.type !== RequestType.CREATE && (
        <div className="py-2">
          <ProductComparison data={snap.dataChangeOriginalRequest?.changes as DiffChange[]} />
        </div>
      )}
    </div>
  );
});
