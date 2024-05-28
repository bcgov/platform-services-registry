'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateRequests from '@/components/table/TableBodyPrivateRequests';
import createClientPage from '@/core/client-page';
import { processPrivateCloudRequestData } from '@/helpers/row-mapper';
import { PrivateCloudRequestSearchedItemPayload } from '@/queries/private-cloud-requests';
import { searchPrivateCloudRequests } from '@/services/backend/private-cloud/requests';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const privateCloudRequests = createClientPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/home',
});
export default privateCloudRequests(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPrivateCloudRequests(snap),
  });

  let requests: PrivateCloudRequestSearchedItemPayload[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    requests = data.docs.map(processPrivateCloudRequestData);
    totalCount = data.totalCount;
  }

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      totalCount={totalCount}
      page={snap.page}
      pageSize={snap.pageSize}
      search={snap.search}
      onPagination={(page: number, pageSize: number) => {
        pageState.page = page;
        pageState.pageSize = pageSize;
      }}
      onSearch={(searchTerm: string) => {
        pageState.page = 1;
        pageState.search = searchTerm;
      }}
      filters={<FilterPanel />}
      isLoading={isLoading}
    >
      <TableBodyPrivateRequests rows={requests} isLoading={isLoading} />
    </Table>
  );
});
