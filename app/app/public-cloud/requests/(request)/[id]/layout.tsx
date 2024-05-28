'use client';

import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconArrowBack, IconInfoCircle, IconFile } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import PublicCloudRequestOptions from '@/components/dropdowns/PublicCloudRequestOptions';
import RequestBadge from '@/components/form/RequestBadge';
import LightButton from '@/components/generic/button/LightButton';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { comparePublicProductData } from '@/helpers/product';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { publicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ pathParams, queryParams, session, children, router }) => {
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPublicCloudRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (request) {
      publicProductState.currentRequest = request;
      publicProductState.licencePlate = request?.licencePlate;
      publicProductState.dataChangeOriginalRequest = comparePublicProductData(
        request.originalData,
        request.requestData,
      );
    }
  }, [request]);

  const tabsByType = {
    [$Enums.RequestType.CREATE]: ['request'],
    [$Enums.RequestType.EDIT]: ['summary', 'original', 'request'],
    [$Enums.RequestType.DELETE]: ['request'],
  };

  let tabs: ITab[] = [
    {
      label: 'SUMMARY',
      name: 'summary',
      href: `/public-cloud/requests/${id}/summary`,
    },
    {
      label: 'ORIGINAL',
      name: 'original',
      href: `/public-cloud/requests/${id}/original`,
    },
    {
      label: 'USER REQUEST',
      name: 'request',
      href: `/public-cloud/requests/${id}/request`,
    },
  ];

  tabs = tabs.filter((tab) => {
    if (!request) return false;

    return tabsByType[request.type].includes(tab.name);
  });

  if (isRequestLoading || !request) return null;

  return (
    <div>
      <div>
        <LightButton onClick={() => router.push('/public-cloud/requests/all')} className="my-2">
          <IconArrowBack className="inline-block" />
          Back to Requests
        </LightButton>
        {request.type !== $Enums.RequestType.CREATE && (
          <LightButton
            onClick={() => router.push(`/public-cloud/products/${request.licencePlate}/edit`)}
            className="my-2 ml-1"
          >
            <IconFile className="inline-block" />
            Go to Product
          </LightButton>
        )}
      </div>

      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 my-2 lg:my-4">
        Public Cloud Landing Zone
        <RequestBadge data={request} />
      </h1>

      {request.decisionStatus !== 'PENDING' && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          A decision has been made for this request.
        </Alert>
      )}

      <Tabs tabs={tabs}>
        <PublicCloudRequestOptions id={request.id} />
      </Tabs>
      <div className="mt-6">{children}</div>
      <ToastContainer />
    </div>
  );
});
