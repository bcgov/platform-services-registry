'use client';

import { Tabs } from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import MembersHistory from '@/components/shared/MembersHistoryTimeLine';
import {
  getPrivateCloudProductMembersHistory,
  getPrivateCloudProductRequests,
} from '@/services/backend/private-cloud/products';
import RequestsHistory from './RequestHistoryTimeLine';

const tabClassname = `
 relative bg-white hover:bg-gray-50 border border-solid border-gray-500
 first:rounded-l-md rtl:first:rounded-r-md last:rounded-r-md rtl:last:rounded-l-md -ml-px first:ml-0 rtl:-mr-px rtl:first:mr-0
 data-[active=true]:z-10 data-[active=true]:bg-bcblue data-[active=true]:border-bcblue data-[active=true]:text-white data-[active=true]:hover:bg-bcblue
`;

export default function HistoryView({ licencePlate }: { licencePlate: string }) {
  const [{ data: requests, isLoading: requestsLoading }, { data: membersRoles, isLoading: membersRolesLoading }] =
    useQueries({
      queries: [
        {
          queryKey: ['requests', licencePlate],
          queryFn: () => getPrivateCloudProductRequests(licencePlate),
          enabled: !!licencePlate,
        },
        {
          queryKey: ['members-history', licencePlate],
          queryFn: () => getPrivateCloudProductMembersHistory(licencePlate),
          enabled: !!licencePlate,
        },
      ],
    });

  return (
    <>
      <Tabs variant="unstyled" defaultValue="requests">
        <Tabs.List grow className="w-fit">
          <Tabs.Tab value="requests" className={tabClassname}>
            Requests
          </Tabs.Tab>
          <Tabs.Tab value="members" className={tabClassname}>
            Members
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="members" pt="xs">
          <MembersHistory membersRoles={membersRoles} />
        </Tabs.Panel>
        <Tabs.Panel value="requests" pt="xs">
          <RequestsHistory requests={requests} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
