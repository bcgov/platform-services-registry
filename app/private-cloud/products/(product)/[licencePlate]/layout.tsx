'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { proxy, useSnapshot } from 'valtio';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';
import { getPriviateCloudProject } from '@/services/backend/private-cloud';
import { PrivateCloudProjectGetPayload } from '@/app/api/private-cloud/project/[licencePlate]/route';

export const productState = proxy<{ currentProduct: PrivateCloudProjectGetPayload | undefined }>({
  currentProduct: undefined,
});

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
  const { licencePlate } = pathParams;

  const { data: currentProduct } = useQuery({
    queryKey: ['currentProduct', licencePlate],
    queryFn: () => getPriviateCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    productState.currentProduct = currentProduct;
  }, [currentProduct]);

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/private-cloud/products/${licencePlate}/${
        currentProduct?.requests && currentProduct.requests.length > 0 ? 'decision' : 'edit'
      }`,
    },
  ];

  if (session?.previews.comments) {
    tabs.push({
      label: 'COMMENTS',
      name: 'comments',
      href: `/private-cloud/products/${licencePlate}/comments`,
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

  if (session?.previews.history) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/private-cloud/products/${licencePlate}/history`,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions
          licensePlace={currentProduct?.licencePlate}
          canReprovision={currentProduct?._permissions?.reprovision}
          canResend={currentProduct?._permissions?.resend}
          canDelete={currentProduct?._permissions?.delete}
        />
      </Tabs>
      <div className="mt-14">{children}</div>
      <ToastContainer />
    </div>
  );
});
