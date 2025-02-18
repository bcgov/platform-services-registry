'use client';

import { Alert, Loader } from '@mantine/core';
import { Cluster } from '@prisma/client';
import { IconInfoCircle, IconLicense } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import TemporaryProductAlert from '@/components/form/TemporaryProductAlert';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import ProductBadge from '@/components/private-cloud/ProductBadge';
import { IS_PROD } from '@/config';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProject, getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { resetState as resetRequestsState } from './requests/state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductLayout = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductLayout(({ getPathParams, session, children }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [state, snap] = usePrivateProductState();
  const { licencePlate = '' } = pathParams ?? {};
  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPrivateCloudProject(licencePlate),
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

  if (snap.currentProduct?._permissions.viewHistory) {
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

  if (!snap.currentProduct || snap.currentProduct.licencePlate !== licencePlate) {
    return null;
  }

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        {snap.currentProduct.name}
        <ProductBadge data={snap.currentProduct} />
      </h1>
      <h3 className="mt-0 italic">Private Cloud OpenShift platform</h3>
      {snap.currentProduct.requests.length > 0 && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          There is already an{' '}
          <Link
            className="underline text-blue-500 font-bold text-lg"
            href={`/private-cloud/requests/${snap.currentProduct.requests[0].id}/decision`}
          >
            active request
          </Link>{' '}
          for this product. You can not edit this product at this time.
        </Alert>
      )}
      {snap.currentProduct.isTest && <TemporaryProductAlert data={snap.currentProduct} />}
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions
          licencePlate={snap.currentProduct?.licencePlate}
          canReprovision={snap.currentProduct?._permissions?.reprovision}
          canDelete={snap.currentProduct?._permissions?.delete}
        />
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
});
