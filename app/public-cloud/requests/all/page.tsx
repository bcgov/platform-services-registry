'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPublicRequests from '@/components/table/TableBodyPublicRequests';
import createClientPage from '@/core/client-page';
import { processPublicCloudRequestData } from '@/helpers/row-mapper';
import { PublicCloudRequestSearchedItemPayload } from '@/queries/public-cloud-requests';
import { searchPublicCloudRequests } from '@/services/backend/public-cloud/requests';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const publicCloudRequests = createClientPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/public-cloud/products/all',
});
export default publicCloudRequests(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPublicCloudRequests(snap),
  });

  let requests: PublicCloudRequestSearchedItemPayload[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    requests = data.docs.map(processPublicCloudRequestData);
    totalCount = data.totalCount;
  }

  return (
    <Table
      title="Products in Public Cloud OpenShift Platform"
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
      <TableBodyPublicRequests rows={requests} isLoading={isLoading} />
    </Table>
  );
});
