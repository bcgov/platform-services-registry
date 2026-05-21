'use client';

import { Button, Select } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataTable from '@/components/generic/data-table/DataTable';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import OriginBadge from '@/components/system/OriginBadge';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { listTeams } from '@/services/backend/teams';

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewTeams],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default Page(({ session }) => {
  const [originFilter, setOriginFilter] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => listTeams(),
  });

  const originOptions = useMemo(
    () =>
      Array.from(new Map((data ?? []).map((item) => [item.originKind, item.originLabel])).entries()).map(
        ([value, label]) => ({
          value,
          label,
        }),
      ),
    [data],
  );

  const filteredData = useMemo(
    () => (originFilter ? (data ?? []).filter((item) => item.originKind === originFilter) : data ?? []),
    [data, originFilter],
  );

  if (isLoading) return null;

  return (
    <div className="pt-5 space-y-4">
      <EntityPageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/home' }, { label: 'Teams' }]}
        title="Teams"
        description="Browse and manage groups of people connected to systems and cloud products."
        actions={
          session?.permissions.manageTeams ? (
            <Button component={Link} href="/teams/create">
              Create Team
            </Button>
          ) : null
        }
      />
      <div className="max-w-sm">
        <Select
          clearable
          label="Filter by Origin"
          data={originOptions}
          value={originFilter}
          onChange={setOriginFilter}
        />
      </div>
      <DataTable
        data={filteredData}
        paginationDisplay="results"
        columns={[
          {
            label: 'Name',
            value: 'name',
            cellFormatter: (item) => <Link href={`/teams/${item.id}`}>{item.name}</Link>,
          },
          { label: 'Code', value: 'code' },
          {
            label: 'Origin',
            value: 'originLabel',
            cellFormatter: (item) => <OriginBadge originKind={item.originKind} label={item.originLabel} />,
          },
          {
            label: 'Members',
            value: 'members.length',
            cellFormatter: (item) => String(item.members?.length ?? 0),
          },
          {
            label: 'Systems',
            value: 'systemLinks.length',
            cellFormatter: (item) => String(item.systemLinks?.length ?? 0),
          },
          {
            label: 'Resources',
            value: 'resourceCount',
            cellFormatter: (item) =>
              String((item.privateCloudProductLinks?.length ?? 0) + (item.publicCloudProductLinks?.length ?? 0)),
          },
        ]}
      />
    </div>
  );
});
