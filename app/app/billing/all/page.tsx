'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio/react';
import Table from '@/components/generic/table/Table';
import { GlobalPermissions } from '@/constants';
import { billingSorts } from '@/constants/billing';
import createClientPage from '@/core/client-page';
import { searchBilling, downloadBillings } from '@/services/backend/billing';
import { BillingSearchResponseDataItem, BillingSearchResponseMetadata } from '@/types/billing';
import FilterPanel from './FilterPanel';
import { pageState } from './state';
import TableBody from './TableBody';

const billingPage = createClientPage({
  permissions: [GlobalPermissions.ViewBilling],
  fallbackUrl: 'login?callbackUrl=/home',
});

export default billingPage(({ session }) => {
  const snap = useSnapshot(pageState);
  let totalCount = 0;
  let billings: BillingSearchResponseDataItem[] = [];
  let metadata!: BillingSearchResponseMetadata;

  const { data, isLoading } = useQuery({
    queryKey: ['billings', snap],
    queryFn: () => searchBilling(snap),
  });

  if (!isLoading && data) {
    billings = data.data;
    totalCount = data.totalCount;
    metadata = data.metadata;
  }

  return (
    <>
      <Table
        title="Billings"
        totalCount={totalCount}
        page={snap.page ?? 1}
        pageSize={snap.pageSize ?? 10}
        sortKey={snap.sortValue}
        onPagination={(page: number, pageSize: number) => {
          pageState.page = page;
          pageState.pageSize = pageSize;
        }}
        onSearch={(searchTearm: string) => {
          pageState.page = 1;
          pageState.search = searchTearm;
        }}
        onExport={async () => {
          const result = await downloadBillings(snap);
          return result;
        }}
        onSort={(sortValue) => {
          pageState.page = 1;
          pageState.sortValue = sortValue;
        }}
        sortOptions={billingSorts.map((val) => val.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBody data={billings} metadata={metadata} session={session!} />
      </Table>
    </>
  );
});
