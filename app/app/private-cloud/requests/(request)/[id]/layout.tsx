'use client';

import { Alert } from '@mantine/core';
import { RequestType } from '@prisma/client';
import { IconArrowBack, IconInfoCircle, IconFile, IconExclamationCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';
import PrivateCloudRequestOptions from '@/components/dropdowns/PrivateCloudRequestOptions';
import RequestBadge from '@/components/form/RequestBadge';
import TemporaryProductAlert from '@/components/form/TemporaryProductAlert';
import LightButton from '@/components/generic/button/LightButton';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import createClientPage from '@/core/client-page';
import { comparePrivateProductData } from '@/helpers/product-change';
import { getPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductSecurityACS(({ pathParams, queryParams, session, children, router }) => {
  const [privateProductState, privateSnap] = usePrivateProductState();
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPrivateCloudRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (request) {
      privateProductState.currentRequest = request;
      privateProductState.licencePlate = request.licencePlate;

      privateProductState.dataChangeOriginalRequest = comparePrivateProductData(
        request.originalData,
        request.requestData,
      );
      privateProductState.dataChangeRequestDecision = comparePrivateProductData(
        request.requestData,
        request.decisionData,
      );
      privateProductState.dataChangeOriginalDecision = comparePrivateProductData(
        request.originalData,
        request.decisionData,
      );
    }
  }, [request]);

  const tabsByType = {
    [RequestType.CREATE]: ['summary', 'request', 'decision', 'comments'],
    [RequestType.EDIT]: ['summary', 'original', 'request', 'decision', 'comments'],
    [RequestType.DELETE]: ['decision', 'comments'],
  };

  let tabs: ITab[] = [
    {
      label: 'SUMMARY',
      name: 'summary',
      href: `/private-cloud/requests/${id}/summary`,
    },
    {
      label: 'ORIGINAL',
      name: 'original',
      href: `/private-cloud/requests/${id}/original`,
    },
    {
      label: 'USER REQUEST',
      name: 'request',
      href: `/private-cloud/requests/${id}/request`,
    },
  ];

  if (request?._permissions.viewDecision) {
    tabs.push({
      label: 'ADMIN DECISION',
      name: 'decision',
      href: `/private-cloud/requests/${id}/decision`,
    });
  }

  if (session?.permissions.viewAllPrivateProductComments) {
    tabs.push({
      label: 'ADMIN COMMENTS',
      name: 'comments',
      href: `/private-cloud/requests/${id}/comments`,
      tooltip: 'Admin Only',
    });
  }

  tabs = tabs.filter((tab) => {
    if (!request) return false;

    return tabsByType[request.type].includes(tab.name);
  });

  if (isRequestLoading || !request || !privateSnap.currentRequest || request.id !== privateSnap.currentRequest.id) {
    return null;
  }

  return (
    <div>
      <div>
        <LightButton onClick={() => router.push('/private-cloud/requests/all')} className="my-2">
          <IconArrowBack className="inline-block" />
          Back to Requests
        </LightButton>
        {request._permissions.viewProduct && (
          <LightButton
            onClick={() => router.push(`/private-cloud/products/${request.licencePlate}/edit`)}
            className="my-2 ml-1"
          >
            <IconFile className="inline-block" />
            Go to Product
          </LightButton>
        )}
      </div>

      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 my-2 lg:my-4">
        Private Cloud OpenShift Platform
        <RequestBadge request={request} />
      </h1>

      {request.decisionStatus !== 'PENDING' && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          A decision has been made for this request.
        </Alert>
      )}
      {request.decisionData.isTest && <TemporaryProductAlert data={{ createdAt: request.project?.createdAt }} />}
      <Tabs tabs={tabs}>
        <PrivateCloudRequestOptions id={request.id} canResend={request._permissions.resend} />
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
});
