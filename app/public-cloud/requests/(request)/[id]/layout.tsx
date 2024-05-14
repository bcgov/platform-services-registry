'use client';

import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import PublicCloudRequestOptions from '@/components/dropdowns/PublicCloudRequestOptions';
import RequestBadge from '@/components/form/RequestBadge';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { publicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
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
    }
  }, [request]);

  const tabs: ITab[] = [
    {
      label: 'SUMMARY',
      name: 'summary',
      href: `/public-cloud/requests/${id}/summary`,
    },
  ];

  if (request?.type !== $Enums.RequestType.CREATE) {
    tabs.push({
      label: 'ORIGINAL',
      name: 'original',
      href: `/public-cloud/requests/${id}/original`,
    });
  }

  tabs.push({
    label: 'USER REQUEST',
    name: 'request',
    href: `/public-cloud/requests/${id}/request`,
  });

  if (isRequestLoading || !request) return null;

  return (
    <div>
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
