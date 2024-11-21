'use client';

import { Alert, Tabs } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { privateProductState } from '@/states/global';
import ProductComments from './ProductComments';
import RequestComments from './RequestComments';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductComments = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductComments(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const snap = useSnapshot(privateProductState);
  const { licencePlate = '' } = pathParams ?? {};

  if (!session || !snap.currentProduct) return null;

  return (
    <div>
      <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />} mb={20}>
        This page is for admin only; users do not have access.
      </Alert>
      <Tabs defaultValue="product" orientation="vertical">
        <Tabs.List>
          <Tabs.Tab value="product">Product</Tabs.Tab>
          <Tabs.Tab value="requests">Requests</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="product">
          <ProductComments licencePlate={licencePlate} productId={snap.currentProduct.id} userId={session.user.id} />
        </Tabs.Panel>
        <Tabs.Panel value="requests">
          <RequestComments licencePlate={licencePlate} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
});
