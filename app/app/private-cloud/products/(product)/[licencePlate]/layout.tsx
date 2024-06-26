'use client';

import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns/differenceInDays';
import Link from 'next/link';
import { useEffect } from 'react';
import { z } from 'zod';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import ProductBadge from '@/components/form/ProductBadge';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProject } from '@/services/backend/private-cloud/products';
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
    queryFn: () => getPrivateCloudProject(licencePlate),
    enabled: !!licencePlate,
  });

  useEffect(() => {
    privateProductState.currentProduct = currentProduct;
  }, [currentProduct]);

  useEffect(() => {
    privateProductState.licencePlate = licencePlate;
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

  if (!currentProduct) {
    return null;
  }
  const diffInDays = 30 - differenceInDays(new Date(), new Date(currentProduct.createdAt));

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 my-2 lg:my-4">
        Private Cloud OpenShift Platform
        <ProductBadge data={currentProduct} />
      </h1>

      {currentProduct.requests.length > 0 && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          There is already an{' '}
          <Link
            className="underline text-blue-500 font-bold text-lg"
            href={`/private-cloud/requests/${currentProduct.requests[0].id}/decision`}
          >
            active request
          </Link>{' '}
          for this product. You can not edit this product at this time.
        </Alert>
      )}
      {currentProduct.isTest && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          <span className="text-red-600/100 font-black text-lg">{Math.abs(diffInDays)}</span>
          {diffInDays > 0 ? ' days until product deletion' : ' days overdue for automatic deletion'}
        </Alert>
      )}
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions
          licencePlate={currentProduct?.licencePlate}
          canReprovision={currentProduct?._permissions?.reprovision}
          canDelete={currentProduct?._permissions?.delete}
        />
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
});
