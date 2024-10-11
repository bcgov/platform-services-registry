'use client';

import { Alert } from '@mantine/core';
import { RequestType } from '@prisma/client';
import { IconArrowBack, IconInfoCircle, IconFile } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';
import PublicCloudRequestOptions from '@/components/dropdowns/PublicCloudRequestOptions';
import RequestBadge from '@/components/form/RequestBadge';
import LightButton from '@/components/generic/button/LightButton';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { comparePublicProductData } from '@/helpers/product-change';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ pathParams, queryParams, session, children, router }) => {
  const [publicProductState, publicSnap] = usePublicProductState();
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
    [RequestType.CREATE]: ['request'],
    [RequestType.EDIT]: ['summary', 'original', 'request'],
    [RequestType.DELETE]: ['request'],
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

  if (isRequestLoading || !request || !publicSnap.currentRequest || request.id !== publicSnap.currentRequest.id) {
    return null;
  }

  return (
    <div>
      <div>
        <LightButton onClick={() => router.push('/public-cloud/requests/all')} className="my-2">
          <IconArrowBack className="inline-block" />
          Back to Requests
        </LightButton>
        {request.type !== RequestType.CREATE && (
          <LightButton
            onClick={() => router.push(`/public-cloud/products/${request.licencePlate}/edit`)}
            className="my-2 ml-1"
          >
            <IconFile className="inline-block" />
            Go to Product
          </LightButton>
        )}
      </div>

      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        {(request.decisionData || request.originalData).name}
        <RequestBadge request={request} />
      </h1>
      <h3 className="mt-0 italic">Public Cloud Landing Zone</h3>

      {request.decisionStatus !== 'PENDING' && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          A decision has been made for this request.
        </Alert>
      )}

      <Tabs tabs={tabs}>
        <PublicCloudRequestOptions id={request.id} />
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
});
