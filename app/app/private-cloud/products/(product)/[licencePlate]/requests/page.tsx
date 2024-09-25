'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import { z } from 'zod';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateRequests from '@/components/table/TableBodyPrivateRequests';
import { requestSortsInProduct } from '@/constants';
import createClientPage from '@/core/client-page';
import { processPrivateCloudRequestData } from '@/helpers/row-mapper';
import { searchPrivateCloudRequests } from '@/services/backend/private-cloud/requests';
import { PrivateCloudRequestSimpleDecorated } from '@/types/private-cloud';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductRequests = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
  fallbackUrl: '/login?callbackUrl=/home',
});
export default privateCloudProductRequests(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);
  const { licencePlate } = pathParams;

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPrivateCloudRequests({ ...snap, licencePlate }),
    enabled: !!licencePlate,
  });

  let requests: PrivateCloudRequestSimpleDecorated[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    requests = data.docs.map(processPrivateCloudRequestData);
    totalCount = data.totalCount;
  }

  return (
    <Table
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
      sortOptions={requestSortsInProduct.map((v) => v.label)}
      filters={<FilterPanel />}
      isLoading={isLoading}
    >
      <TableBodyPrivateRequests rows={requests} isLoading={isLoading} />
    </Table>
  );
});
