'use client';

import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import PublicUserTabs from '@/components/tabs/PublicUsersTabs';

const headers = [
  { field: 'firstName', headerName: 'First Name' },
  { field: 'lastName', headerName: 'Last Name' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'email', headerName: 'Email' },
  { field: 'delete', headerName: 'Delete' },
];

// async function fetchUsers(id: string): Promise<any> {
//   return 'data';
// }

export default function PublicUsers({ params }: { params: {} }) {
  return (
    <div>
      <PublicUserTabs />
      <Table
        title="Public Cloud Users"
        description="Public Cloud Users"
        tableBody={<TableBody headers={headers} rows={[{}]} />}
        total={10}
        currentPage={1}
        pageSize={10}
      />
    </div>
  );
}
