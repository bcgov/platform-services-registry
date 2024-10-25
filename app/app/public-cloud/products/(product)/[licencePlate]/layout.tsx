'use client';

import { Provider } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import ProductBadge from '@/components/form/ProductBadge';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPublicCloudProject } from '@/services/backend/public-cloud/products';
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

  const [publicProductState, publicProductSnap] = usePublicProductState();
  const { licencePlate = '' } = pathParams ?? {};

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPublicCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    publicProductState.currentProduct = currentProduct;
    resetRequestsState();
  }, [currentProduct]);

  useEffect(() => {
    publicProductState.licencePlate = licencePlate;
  }, [licencePlate]);

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/public-cloud/products/${licencePlate}/edit`,
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

  if (!publicProductSnap.currentProduct || publicProductSnap.currentProduct.licencePlate !== licencePlate) {
    return null;
  }

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        {publicProductSnap.currentProduct.name}
        <ProductBadge data={currentProduct} />
      </h1>
      <h3 className="mt-0 italic"> Public Cloud Landing Zone</h3>

      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={!currentProduct?._permissions?.delete} />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
});
