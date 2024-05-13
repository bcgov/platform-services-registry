'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { getPriviateCloudProject } from '@/services/backend/private-cloud/products';
import { privateProductState } from '@/states/global';

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
    privateProductState.currentProduct = currentProduct;
  }, [currentProduct]);

  useEffect(() => {
    privateProductState.licencePlate = licencePlate;
  }, [licencePlate]);

  let mode = 'decision';
  if (currentProduct) {
    mode = currentProduct.requests.length > 0 ? 'decision' : 'edit';
  }

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/private-cloud/products/${licencePlate}/${mode}`,
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

  if (currentProduct?._permissions.viewHistory) {
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
