'use client';

import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import ProductBadge from '@/components/public-cloud/ProductBadge';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { getPublicCloudProduct } from '@/services/backend/public-cloud/products';
import { usePublicProductState } from '@/states/global';
import { resetState as resetRequestsState } from './requests/state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ getPathParams, children }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [state, snap] = usePublicProductState();
  const { licencePlate = '' } = pathParams ?? {};

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPublicCloudProduct(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    state.currentProduct = currentProduct;
    resetRequestsState();
  }, [currentProduct]);

  useEffect(() => {
    state.licencePlate = licencePlate;
  }, [licencePlate]);

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/public-cloud/products/${licencePlate}/edit`,
    },
    {
      label: 'BILLING',
      name: 'billing',
      href: `/public-cloud/products/${licencePlate}/billing`,
    },
    {
      label: 'REQUESTS',
      name: 'requests',
      href: `/public-cloud/products/${licencePlate}/requests`,
    },
  ];

  if (currentProduct?.provider === Provider.AWS) {
    tabs.push({
      label: 'ROLES',
      name: 'aws-roles',
      href: `/public-cloud/products/${licencePlate}/aws-roles/admins`,
      ignoreSegments: 1,
    });
  }

  if (currentProduct?._permissions.viewHistory) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/public-cloud/products/${licencePlate}/history`,
    });
  }

  if (!snap.currentProduct || snap.currentProduct.licencePlate !== licencePlate) {
    return null;
  }

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        {snap.currentProduct.name}
        <ProductBadge data={snap.currentProduct} />
      </h1>
      <h3 className="mt-0 italic"> Public Cloud Landing Zone</h3>
      {snap.currentProduct.requests.length > 0 && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          There is already an{' '}
          <Link
            className="underline text-blue-500 font-bold text-lg"
            href={`/public-cloud/requests/${snap.currentProduct.requests[0].id}/request`}
          >
            active request
          </Link>{' '}
          for this product. You can not edit this product at this time.
        </Alert>
      )}
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={!currentProduct?._permissions?.delete} />
      </Tabs>
      <div className="mt-10"> {children}</div>
    </div>
  );
});
