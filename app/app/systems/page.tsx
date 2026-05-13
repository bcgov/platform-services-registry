'use client';

import { Button } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import DataTable from '@/components/generic/data-table/DataTable';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { listSystems } from '@/services/backend/systems';

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewSystems],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default Page(({ session }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => listSystems(),
  });

  if (isLoading) return null;

  return (
    <div className="pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">Systems</h1>
        {session?.permissions.manageSystems && (
          <Button component={Link} href="/systems/create">
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
            cellFormatter: (item) => <Link href={`/systems/${item.id}`}>{item.name}</Link>,
          },
          { label: 'Code', value: 'code' },
          { label: 'Status', value: 'status' },
          {
            label: 'Organization',
            value: 'organization.name',
            cellFormatter: (item) => item.organization?.name ?? '',
          },
        ]}
      />
    </div>
  );
});
