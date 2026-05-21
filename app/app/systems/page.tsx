'use client';

import { Button, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/generic/data-table/DataTable';
import { failure, success } from '@/components/notification';
import ConsolidationBadge, { getConsolidationState } from '@/components/system/ConsolidationBadge';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import OriginBadge from '@/components/system/OriginBadge';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { archiveSystems, listSystems } from '@/services/backend/systems';

const Page = createClientPage({
  permissions: [GlobalPermissions.ViewSystems],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default Page(({ session }) => {
  const [originFilter, setOriginFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [archivedFilter, setArchivedFilter] = useState<'hide' | 'show' | 'only'>('hide');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['systems', 'all'],
    queryFn: () => listSystems({ includeArchived: true }),
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
    () =>
      (data ?? []).filter((item) => {
        const matchesOrigin = originFilter ? item.originKind === originFilter : true;
        const matchesSearch = searchTerm
          ? (item.name ?? '').toLowerCase().includes(searchTerm.trim().toLowerCase())
          : true;
        const isArchived = item.status === 'ARCHIVED' || !!item.archivedAt;
        const matchesArchived = archivedFilter === 'show' ? true : archivedFilter === 'only' ? isArchived : !isArchived;

        return matchesOrigin && matchesSearch && matchesArchived;
      }),
    [data, originFilter, searchTerm, archivedFilter],
  );

  useEffect(() => {
    const visibleIds = new Set(filteredData.map((item) => item.id));
    setSelectedRowIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [filteredData]);

  const handleArchiveSelected = async () => {
    if (selectedRowIds.length === 0 || isArchiving) return;

    try {
      setIsArchiving(true);
      await archiveSystems(selectedRowIds);
      setSelectedRowIds([]);
      await refetch();
      success({
        title: 'Systems archived',
        message: `${selectedRowIds.length} system${selectedRowIds.length === 1 ? '' : 's'} archived.`,
      });
    } catch (error) {
      failure({ error: error as Error });
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="pt-5 space-y-4">
      <EntityPageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/home' }, { label: 'Systems' }]}
        title="Systems"
        description="Browse and manage system containers that group related teams and cloud products."
        actions={
          session?.permissions.manageSystems ? (
            <Button component={Link} href="/systems/create">
              Create System
            </Button>
          ) : null
        }
      />
      <div className="grid gap-4 md:grid-cols-3 md:max-w-5xl">
        <TextInput
          label="Search by Name"
          placeholder="Search systems"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
        />
        <Select
          clearable
          label="Filter by Origin"
          data={originOptions}
          value={originFilter}
          onChange={setOriginFilter}
        />
        <Select
          label="Archived"
          data={[
            { value: 'hide', label: 'Hide Archived' },
            { value: 'show', label: 'Show Archived' },
            { value: 'only', label: 'Only Archived' },
          ]}
          value={archivedFilter}
          onChange={(value) => setArchivedFilter((value as 'hide' | 'show' | 'only') ?? 'hide')}
        />
      </div>
      {session?.permissions.manageSystems ? (
        <div className="flex items-center justify-between gap-4 rounded-sm border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-700">
            {selectedRowIds.length > 0
              ? `${selectedRowIds.length} system${selectedRowIds.length === 1 ? '' : 's'} selected`
              : 'Select one or more systems to archive them in bulk.'}
          </div>
          <Button
            color="red"
            disabled={selectedRowIds.length === 0}
            loading={isArchiving}
            onClick={handleArchiveSelected}
          >
            Archive Selected
          </Button>
        </div>
      ) : null}
      <DataTable
        data={filteredData}
        paginationDisplay="results"
        getRowHref={(item) => `/systems/${item.id}`}
        selectableRows={session?.permissions.manageSystems}
        getRowId={(item) => item.id}
        selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={setSelectedRowIds}
        columns={[
          {
            label: 'Name',
            value: 'name',
            width: '20rem',
            cellFormatter: (item) => (
              <Link href={`/systems/${item.id}`} className="block truncate" title={item.name || '(Unnamed system)'}>
                {item.name || '(Unnamed system)'}
              </Link>
            ),
          },
          { label: 'Code', value: 'code', width: '7rem' },
          {
            label: 'Origin',
            value: 'originLabel',
            width: '14rem',
            truncate: false,
            cellFormatter: (item) => <OriginBadge originKind={item.originKind} label={item.originLabel} />,
          },
          {
            label: 'Consolidation',
            value: 'metadata',
            width: '10rem',
            truncate: false,
            sortValue: (item) => getConsolidationState(item.metadata),
            cellFormatter: (item) => <ConsolidationBadge metadata={item.metadata} />,
          },
          { label: 'Status', value: 'status', width: '8rem' },
          {
            label: 'Organization',
            value: 'organization.name',
            width: '16rem',
            cellFormatter: (item) => item.organization?.name ?? '',
          },
          {
            label: 'Teams',
            value: 'teamLinks.length',
            width: '6rem',
            cellFormatter: (item) => String(item.teamLinks?.length ?? 0),
          },
          {
            label: 'Resources',
            value: 'resourceCount',
            width: '7rem',
            cellFormatter: (item) =>
              String((item.privateCloudProductLinks?.length ?? 0) + (item.publicCloudProductLinks?.length ?? 0)),
          },
        ]}
      />
    </div>
  );
});
