'use client';

import { proxy, useSnapshot } from 'valtio';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/helpers/row-mapper';
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

  let requests = [];
  let totalCount = 0;

  if (!isLoading && data) {
    const transformActiveRequests = data.docs.map((request) => ({
      ...request.userRequestedProject,
      created: request.created,
      updatedAt: request.updatedAt,
      requests: [request],
      id: request.id,
    }));

    requests = transformActiveRequests.map(publicCloudProjectDataToRow);
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
    >
      <TableBody rows={requests} isLoading={isLoading} />
    </Table>
  );
});
