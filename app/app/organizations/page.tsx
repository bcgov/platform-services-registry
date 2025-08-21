'use client';

import { Button } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import _compact from 'lodash-es/compact';
import _get from 'lodash-es/get';
import DataTable from '@/components/generic/data-table/DataTable';
import { openConfirmModal } from '@/components/modal/confirm';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { Organization } from '@/prisma/client';
import { listOrganizations, deleteOrganization as _deleteOrganization } from '@/services/backend/organizations';
import { openCreateModal } from './createModal';
import { openUpdateModal } from './updateModal';

interface ColumnDef {
  label?: string;
  value: string;
  cellFormatter: (org: Organization, attr: string) => React.ReactNode;
}

const Page = createClientPage({
  roles: [GlobalRole.User],
});
export default Page(({ session }) => {
  const {
    data: organizations,
    isLoading: isOrganizationsLoading,
    isError: isOrganizationsError,
    error: organizationsError,
    refetch: refetchOrganizations,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => listOrganizations(),
    refetchInterval: 60000,
  });

  const { mutateAsync: deleteOrganization, isPending: isDeletingOrganization } = useMutation({
    mutationFn: (id: string) => _deleteOrganization(id),
  });

  const tableColumns: ColumnDef[] = [
    {
      label: 'Code',
      value: 'code',
      cellFormatter: (org, attr) => <span className="whitespace-nowrap">{org.code}</span>,
    },
    {
      label: 'Name',
      value: 'name',
      cellFormatter: (org, attr) => <span className="whitespace-nowrap">{org.name}</span>,
    },
    {
      label: 'AG Ministry',
      value: 'isAgMinistry',
      cellFormatter: (org, attr) => <span className="whitespace-nowrap">{org.isAgMinistry ? 'Yes' : 'No'}</span>,
    },
  ];

  if (session?.permissions.manageOrganizations) {
    tableColumns.push({
      label: '',
      value: 'actionButtons',
      cellFormatter: (org, attr) => {
        if (!session?.permissions.manageOrganizations) {
          return null;
        }

        return (
          <>
            <Button
              className="mr-1"
              variant="outline"
              onClick={async () => {
                await openUpdateModal(org);
                await refetchOrganizations();
              }}
            >
              Update
            </Button>
            <Button
              className="mr-1"
              color="danger"
              variant="outline"
              onClick={async () => {
                const res = await openConfirmModal({});
                if (res.state.confirmed) {
                  await deleteOrganization(org.id);
                  await refetchOrganizations();
                }
              }}
            >
              Delete
            </Button>
          </>
        );
      },
    });
  }

  if (isOrganizationsLoading) {
    return null;
  }

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">Organizations</h1>

      {session?.permissions.manageOrganizations && (
        <div className="text-right mb-1">
          <Button
            color="blue"
            onClick={async () => {
              await openCreateModal({});
              await refetchOrganizations();
            }}
          >
            Create
          </Button>
        </div>
      )}
      <DataTable<Organization> data={organizations ?? []} columns={tableColumns} />
    </div>
  );
});
