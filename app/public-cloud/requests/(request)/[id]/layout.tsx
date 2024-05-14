'use client';

import { $Enums } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import PublicCloudRequestOptions from '@/components/dropdowns/PublicCloudRequestOptions';
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
      <Tabs tabs={tabs}>
        <PublicCloudRequestOptions id={request.id} />
      </Tabs>
      <div className="mt-6">{children}</div>
      <ToastContainer />
    </div>
  );
});
