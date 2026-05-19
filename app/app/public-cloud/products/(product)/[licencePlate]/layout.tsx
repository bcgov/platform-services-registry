'use client';

import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import ProductBadge from '@/components/public-cloud/ProductBadge';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import ProductAttachmentsPanel from '@/components/system/ProductAttachmentsPanel';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { getPublicCloudProduct } from '@/services/backend/public-cloud/products';
import { usePublicProductState } from '@/states/global';
import { resetState as resetRequestsState } from './requests/ListView/state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ getPathParams, children }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const pathname = usePathname();

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

  const isResourceArea = pathname.startsWith('/resources/public-cloud-landing-zone');
  const productBasePath = isResourceArea
    ? `/resources/public-cloud-landing-zone/products/${licencePlate}`
    : `/public-cloud/products/${licencePlate}`;
  const resourceParentHref = isResourceArea ? '/resources/public-cloud-landing-zone' : '/public-cloud/products/all';

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `${productBasePath}/edit`,
    },
    {
      label: 'BILLING',
      name: 'billing',
      href: `${productBasePath}/billing`,
    },
    {
      label: 'REQUESTS',
      name: 'requests',
      href: `${productBasePath}/requests`,
    },
  ];

  if (currentProduct?.provider === Provider.AWS) {
    tabs.push({
      label: 'ROLES',
      name: 'aws-roles',
      href: `${productBasePath}/aws-roles/admins`,
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
          { label: 'Public Cloud Landing Zone', href: resourceParentHref },
          { label: snap.currentProduct.name },
        ]}
        title={snap.currentProduct.name}
        description="Public Cloud Landing Zone product detail."
        actions={<ProductBadge data={snap.currentProduct} />}
      />
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
      <ProductAttachmentsPanel context="public" licencePlate={licencePlate} />
      <div className="mt-10"> {children}</div>
    </div>
  );
});
