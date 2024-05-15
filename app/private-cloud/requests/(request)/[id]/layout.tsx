'use client';

import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import PrivateCloudRequestOptions from '@/components/dropdowns/PrivateCloudRequestOptions';
import RequestBadge from '@/components/form/RequestBadge';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { getPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { privateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPrivateCloudRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (request) {
      privateProductState.currentRequest = request;
      privateProductState.licencePlate = request?.licencePlate;
    }
  }, [request]);

  const tabs: ITab[] = [
    {
      label: 'SUMMARY',
      name: 'summary',
      href: `/private-cloud/requests/${id}/summary/origin-request`,
      ignoreSegments: 1,
    },
  ];

  if (request?.type !== $Enums.RequestType.CREATE) {
    tabs.push({
      label: 'ORIGINAL',
      name: 'original',
      href: `/private-cloud/requests/${id}/original`,
    });
  }

  tabs.push({
    label: 'USER REQUEST',
    name: 'request',
    href: `/private-cloud/requests/${id}/request`,
  });

  if (request?._permissions.review || !request?.active) {
    tabs.push({
      label: 'ADMIN DECISION',
      name: 'decision',
      href: `/private-cloud/requests/${id}/decision`,
    });
  }

  if (isRequestLoading || !request) return null;

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 my-2 lg:my-4">
        Private Cloud OpenShift Platform
        <RequestBadge data={request} />
      </h1>

      {request.decisionStatus !== 'PENDING' && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          A decision has been made for this request.
        </Alert>
      )}

      <Tabs tabs={tabs}>
        <PrivateCloudRequestOptions id={request.id} canResend={request._permissions.resend} />
      </Tabs>
      <div className="mt-6">{children}</div>
      <ToastContainer />
    </div>
  );
});
