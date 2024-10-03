'use client';

import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';
import { z } from 'zod';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import ProductBadge from '@/components/form/ProductBadge';
import TemporaryProductAlert from '@/components/form/TemporaryProductAlert';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import { IS_PROD } from '@/config';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProject } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { resetState as resetRequestsState } from './requests/state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductLayout = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductLayout(({ pathParams, queryParams, session, children }) => {
  const [privateState, privateSnap] = usePrivateProductState();
  const { licencePlate } = pathParams;

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPrivateCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    privateState.currentProduct = currentProduct;
    resetRequestsState();
  }, [currentProduct]);

  useEffect(() => {
    privateState.licencePlate = licencePlate;
  }, [licencePlate]);

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/private-cloud/products/${licencePlate}/edit`,
    },
    {
      label: 'REQUESTS',
      name: 'requests',
      href: `/private-cloud/products/${licencePlate}/requests`,
    },
  ];

  if (session?.permissions.viewAllPrivateProductComments) {
    tabs.push({
      label: 'ADMIN NOTES',
      name: 'comments',
      href: `/private-cloud/products/${licencePlate}/comments`,
      tooltip: 'Admin only',
    });
  }

  if (session?.previews.security) {
    tabs.push({
      label: 'SECURITY',
      name: 'security',
      href: `/private-cloud/products/${licencePlate}/security/repository`,
      ignoreSegments: 1,
    });
  }

  if (privateSnap.currentProduct?._permissions.viewHistory) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/private-cloud/products/${licencePlate}/history`,
    });
  }

  if (!IS_PROD) {
    tabs.push({
      label: 'RESOURCE USAGE',
      name: 'usage',
      href: `/private-cloud/products/${licencePlate}/usage`,
    });
  }

  if (!privateSnap.currentProduct || privateSnap.currentProduct.licencePlate !== licencePlate) {
    return null;
  }

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 my-2 lg:my-4">
        {privateSnap.currentProduct.name}
        <ProductBadge data={privateSnap.currentProduct} />
      </h1>

      {privateSnap.currentProduct.requests.length > 0 && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          There is already an{' '}
          <Link
            className="underline text-blue-500 font-bold text-lg"
            href={`/private-cloud/requests/${privateSnap.currentProduct.requests[0].id}/decision`}
          >
            active request
          </Link>{' '}
          for this product. You can not edit this product at this time.
        </Alert>
      )}
      {privateSnap.currentProduct.isTest && <TemporaryProductAlert data={privateSnap.currentProduct} />}
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions
          licencePlate={privateSnap.currentProduct?.licencePlate}
          canReprovision={privateSnap.currentProduct?._permissions?.reprovision}
          canDelete={privateSnap.currentProduct?._permissions?.delete}
        />
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
});
