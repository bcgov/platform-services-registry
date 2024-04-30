'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import { getPublicCloudProject } from '@/services/backend/public-cloud/products';
import { publicProductState } from '@/states/global';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
  const { licencePlate } = pathParams;

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPublicCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    publicProductState.currentProduct = currentProduct;
  }, [currentProduct]);

  useEffect(() => {
    publicProductState.licencePlate = licencePlate;
  }, [licencePlate]);

  let mode = 'decision';
  if (currentProduct) {
    mode = currentProduct.requests.length > 0 ? 'decision' : 'edit';
  }

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/public-cloud/products/${licencePlate}/${mode}`,
    },
    {
      label: 'ROLES',
      name: 'aws-roles',
      href: `/public-cloud/products/${licencePlate}/aws-roles/admins`,
      ignoreSegments: 1,
    },
  ];

  if (currentProduct?._permissions.viewHistory) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/public-cloud/products/${licencePlate}/history`,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={!currentProduct?._permissions?.delete} />
      </Tabs>
      <div className="mt-14"> {children}</div>
      <ToastContainer />
    </div>
  );
});
