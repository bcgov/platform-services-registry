'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio/react';
import Table from '@/components/generic/table/Table';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadEvents, searchEvents } from '@/services/backend/events';
import FilterPanel from './FilterPanel';
import { eventSorts, pageState } from './state';
import TableBody from './TableBody';

const eventsPage = createClientPage({
  permissions: [GlobalPermissions.ViewEvents],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default eventsPage(() => {
  const snap = useSnapshot(pageState);
  let totalCount = 0;
  let events = [];

  const { data, isLoading } = useQuery({
    queryKey: ['events', snap],
    queryFn: () => searchEvents(snap),
  });

  if (!isLoading && data) {
    events = data.data;
    totalCount = data.totalCount;
  }
  return (
    <>
      <Table
        title="Events in Registry"
        totalCount={totalCount}
        page={snap.page}
        pageSize={snap.pageSize}
        sortKey={snap.sortValue}
        onPagination={(page: number, pageSize: number) => {
          pageState.page = page;
          pageState.pageSize = pageSize;
        }}
        onSearch={(searchTerm: string) => {
          pageState.page = 1;
          pageState.search = searchTerm;
        }}
        onExport={async () => {
          const result = await downloadEvents(snap);
          return result;
        }}
        onSort={(sortValue) => {
          pageState.page = 1;
          pageState.sortValue = sortValue;
        }}
        sortOptions={eventSorts.map((val) => val.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBody data={events} />
      </Table>
    </>
  );
});
