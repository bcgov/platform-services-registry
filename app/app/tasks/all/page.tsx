'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio/react';
import Table from '@/components/generic/table/Table';
import { GlobalPermissions } from '@/constants';
import { taskSorts, ExtendedTask } from '@/constants/task';
import createClientPage from '@/core/client-page';
import { downloadTasks, searchTasks } from '@/services/backend/tasks';
import FilterPanel from './FilterPanel';
import { pageState } from './state';
import TableBody from './TableBody';

const tasksPage = createClientPage({
  permissions: [GlobalPermissions.ViewTasks],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default tasksPage(() => {
  const snap = useSnapshot(pageState);
  let totalCount = 0;
  let tasks: ExtendedTask[] = [];

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', snap],
    queryFn: () => searchTasks(snap),
  });

  if (!isLoading && data) {
    tasks = data.data;
    totalCount = data.totalCount;
  }
  return (
    <>
      <Table
        title="Tasks in Registry"
        totalCount={totalCount}
        page={snap.page ?? 1}
        pageSize={snap.pageSize ?? 10}
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
          const result = await downloadTasks(snap);
          return result;
        }}
        onSort={(sortValue) => {
          pageState.page = 1;
          pageState.sortValue = sortValue;
        }}
        sortOptions={taskSorts.map((val) => val.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBody data={tasks} />
      </Table>
    </>
  );
});
