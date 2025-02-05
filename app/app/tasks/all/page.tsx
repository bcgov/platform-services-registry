'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio/react';
import Table from '@/components/generic/table/Table';
import { GlobalPermissions } from '@/constants';
import { taskSorts } from '@/constants/task';
import createClientPage from '@/core/client-page';
import { downloadTasks, searchTasks } from '@/services/backend/tasks';
import { SearchTask } from '@/types/task';
import FilterPanel from './FilterPanel';
import { pageState } from './state';
import TableBody from './TableBody';

const tasksPage = createClientPage({
  permissions: [GlobalPermissions.ViewTasks],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default tasksPage(() => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', snap],
    queryFn: () => searchTasks(snap),
  });

  let tasks: SearchTask[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    tasks = data.data;
    totalCount = data.totalCount;
  }

  return (
    <Table
      title="Tasks"
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
  );
});
