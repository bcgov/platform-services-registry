'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { proxy, useSnapshot } from 'valtio';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';
import { getPublicCloudProject } from '@/services/backend/public-cloud';
import { PublicCloudProjectGetPayload } from '@/app/api/public-cloud/project/[licencePlate]/route';

export const productState = proxy<{ currentProduct: PublicCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});

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
    productState.currentProduct = currentProduct;
  }, [currentProduct]);

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

  if (session?.previews.history) {
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
