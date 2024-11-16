'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import { userSorts, GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchUsers } from '@/services/backend/user';
import { AdminViewUsers } from '@/types/user';
import FilterPanel from './FilterPanel';
import { pageState } from './state';
import TableBody from './TableBody';

const usersPage = createClientPage({
  permissions: [GlobalPermissions.ViewUsers],
  fallbackUrl: '/login?callbackUrl=/home',
});
export default usersPage(({ session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['users', snap],
    queryFn: () => searchUsers(snap),
  });

  let users: AdminViewUsers[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    users = data.data;
    totalCount = data.totalCount;
  }

  return (
    <>
      <Table
        title="Users in Registry"
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
        sortOptions={userSorts.map((v) => v.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBody data={users} isLoading={isLoading} />
      </Table>
    </>
  );
});
