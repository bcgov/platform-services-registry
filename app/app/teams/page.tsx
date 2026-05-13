'use client';

import { Button } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import DataTable from '@/components/generic/data-table/DataTable';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { listTeams } from '@/services/backend/teams';

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewTeams],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default Page(({ session }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => listTeams(),
  });

  if (isLoading) return null;

  return (
    <div className="pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">Teams</h1>
        {session?.permissions.manageTeams && (
          <Button component={Link} href="/teams/create">
            Create
          </Button>
        )}
      </div>
      <DataTable
        data={data ?? []}
        columns={[
          {
            label: 'Name',
            value: 'name',
            cellFormatter: (item) => <Link href={`/teams/${item.id}`}>{item.name}</Link>,
          },
          { label: 'Code', value: 'code' },
          {
            label: 'Members',
            value: 'members.length',
            cellFormatter: (item) => String(item.members?.length ?? 0),
          },
        ]}
      />
    </div>
  );
});
