'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateRequests from '@/components/table/TableBodyPrivateRequests';
import { requestSorts } from '@/constants';
import createClientPage from '@/core/client-page';
import { processPrivateCloudRequestData } from '@/helpers/row-mapper';
import { searchPrivateCloudRequests } from '@/services/backend/private-cloud/requests';
import { PrivateCloudRequestSimpleDecorated } from '@/types/private-cloud';
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

  let requests: PrivateCloudRequestSimpleDecorated[] = [];
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
      page={snap.page ?? 1}
      pageSize={snap.pageSize ?? 10}
      search={snap.search}
      sortKey={snap.sortValue}
      onPagination={(page: number, pageSize: number) => {
        pageState.page = page;
        pageState.pageSize = pageSize;
      }}
      onSearch={(searchTerm: string) => {
        pageState.page = 1;
        pageState.search = searchTerm;
      }}
      onSort={(sortValue) => {
        pageState.page = 1;
        pageState.sortValue = sortValue;
      }}
      sortOptions={requestSorts.map((v) => v.label)}
      filters={<FilterPanel />}
      isLoading={isLoading}
    >
      <TableBodyPrivateRequests rows={requests} isLoading={isLoading} />
    </Table>
  );
});
