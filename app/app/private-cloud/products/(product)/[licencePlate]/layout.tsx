'use client';

import { Alert, Loader } from '@mantine/core';
import { IconInfoCircle, IconLicense } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import TemporaryProductAlert from '@/components/form/TemporaryProductAlert';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import ProductBadge from '@/components/private-cloud/ProductBadge';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import ProductAttachmentsPanel from '@/components/system/ProductAttachmentsPanel';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProduct, getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { resetState as resetRequestsState } from './requests/ListView/state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductLayout = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductLayout(({ getPathParams, session, children }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const pathname = usePathname();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [state, snap] = usePrivateProductState();
  const { licencePlate = '' } = pathParams ?? {};
  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPrivateCloudProduct(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    state.currentProduct = currentProduct;
    resetRequestsState();
  }, [currentProduct]);

  useEffect(() => {
    state.licencePlate = licencePlate;
  }, [licencePlate]);

  const isResourceArea = pathname.startsWith('/resources/private-cloud-openshift');
  const productBasePath = isResourceArea
    ? `/resources/private-cloud-openshift/products/${licencePlate}`
    : `/private-cloud/products/${licencePlate}`;
  const resourceParentHref = isResourceArea ? '/resources/private-cloud-openshift' : '/private-cloud/products/all';

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `${productBasePath}/edit`,
    },
    {
      label: 'REQUESTS',
      name: 'requests',
      href: `${productBasePath}/requests`,
    },
    {
      label: 'RESOURCE USAGE',
      name: 'usage',
      href: `${productBasePath}/usage`,
    },
  ];

  if (session?.permissions.viewAllPrivateProductComments) {
    tabs.push({
      label: 'ADMIN NOTES',
      name: 'comments',
      href: `${productBasePath}/comments`,
      tooltip: 'Admin only',
    });
  }

  if (session?.previews.costRecovery) {
    tabs.push({
      label: 'COSTS',
      name: 'costs',
      href: `${productBasePath}/costs`,
    });
  }

  if (session?.previews.security) {
    tabs.push({
      label: 'SECURITY',
      name: 'security',
      href: `${productBasePath}/security/repository`,
      ignoreSegments: 1,
    });
  }

  if (!snap.currentProduct || snap.currentProduct.licencePlate !== licencePlate) {
    return null;
  }

  return (
    <div>
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Resources', href: '/resources' },
          { label: 'Private Cloud OpenShift', href: resourceParentHref },
          { label: snap.currentProduct.name },
        ]}
        title={snap.currentProduct.name}
        description="Private Cloud OpenShift product detail."
        actions={<ProductBadge data={snap.currentProduct} />}
      />
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
      <ProductAttachmentsPanel context="private" licencePlate={licencePlate} />
      <div className="mt-6">{children}</div>
    </div>
  );
});
