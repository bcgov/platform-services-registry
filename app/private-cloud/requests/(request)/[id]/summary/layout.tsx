'use client';

import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { z } from 'zod';
import SecondaryTabs, { ITab } from '@/components/generic/tabs/SecondaryTabs';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const Layout = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default Layout(({ pathParams, queryParams, session, router, children }) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();
  const { id } = pathParams;

  const tabs: ITab[] = [
    {
      name: 'origin-request',
      label: 'Original ... Request',
      href: `/private-cloud/requests/${id}/summary/origin-request`,
    },
    {
      name: 'request-decision',
      label: 'Request ... Decision',
      href: `/private-cloud/requests/${id}/summary/request-decision`,
    },
    {
      name: 'origin-decision',
      label: 'Original ... Decision',
      href: `/private-cloud/requests/${id}/summary/origin-decision`,
    },
  ];

  return (
    <div>
      {privateCloudStateSnap.currentRequest?.decisionStatus === $Enums.DecisionStatus.PENDING && (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
          This request is under review by the admin.
        </Alert>
      )}

      <div className="mb-2"></div>

      <SecondaryTabs tabs={tabs} />
      <div className="my-1">{children}</div>
    </div>
  );
});
