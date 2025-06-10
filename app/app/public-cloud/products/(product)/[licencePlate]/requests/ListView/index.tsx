'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPublicRequests from '@/components/table/TableBodyPublicRequests';
import { requestSortsInProduct, GlobalRole } from '@/constants';
import { processPublicCloudRequestData } from '@/helpers/row-mapper';
import { searchPublicCloudRequests } from '@/services/backend/public-cloud/requests';
import { PublicCloudRequestSimpleDecorated } from '@/types/public-cloud';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

export default function ListView({ licencePlate }: { licencePlate: string }) {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPublicCloudRequests({ ...snap, licencePlate }),
    refetchInterval: 5000,
    enabled: !!licencePlate,
  });

  let requests: PublicCloudRequestSimpleDecorated[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    requests = data.docs.map(processPublicCloudRequestData);
    totalCount = data.totalCount;
  }

  return (
    <>
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
        <TableBodyPublicRequests rows={requests} isLoading={isLoading} />
      </Table>
    </>
  );
}
