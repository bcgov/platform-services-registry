'use client';

import { Badge, Button } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import _compact from 'lodash-es/compact';
import _get from 'lodash-es/get';
import { useMemo } from 'react';
import DataTable from '@/components/generic/data-table/DataTable';
import type { ColumnDefinition } from '@/components/generic/data-table/DataTable';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { listKeycloakTeamApiAccounts } from '@/services/backend/keycloak';
import { openCreateAccountModal } from './createAccountModal';
import { openManageAccountModal } from './manageAccountModal';
import { openViewAccountModal } from './viewAccountModal';

interface TeamApiAccount {
  name: string;
  roles: string[];
  id: string;
  clientId: string;
  secret: string;
}

const TeamApiAccountsPage = createClientPage({
  roles: [GlobalRole.User],
});
export default TeamApiAccountsPage(({ session }) => {
  const {
    data: apiAccounts,
    isLoading: isApiAccountsLoading,
    isError: isApiAccountsError,
    error: apiAccountsError,
    refetch: refetchApiAccounts,
  } = useQuery({
    queryKey: ['apiAccounts'],
    queryFn: () => listKeycloakTeamApiAccounts(),
  });

  const { data: tableData, columns: tableColumns } = useMemo(() => {
    if (!apiAccounts) return { data: [], columns: [] };

    const _columns: ColumnDefinition<TeamApiAccount>[] = [
      {
        label: 'Name',
        value: 'name',
        cellFormatter: (account, attr) => (
          <span className="whitespace-nowrap">
            {account.name}{' '}
            <Badge color="green" radius="sm" className="ml-1">
              Active
            </Badge>
          </span>
        ),
      },
      {
        label: 'Roles',
        value: 'roles',
        cellFormatter: (account, attr) => (
          <>
            {account.roles.map((role) => (
              <Badge key={role} color="gray" radius="sm" className="mr-1">
                {role}
              </Badge>
            ))}
          </>
        ),
      },
      {
        label: '',
        value: 'actionButtons',
        cellFormatter: (account, attr) => (
          <>
            <Button
              className="mr-1"
              variant="outline"
              onClick={async () => {
                await openViewAccountModal({
                  clientUid: account.id,
                  clientId: account.clientId,
                  clientSecret: account.secret,
                  name: account.name,
                  roles: account.roles,
                });
              }}
            >
              View
            </Button>
            {session?.isAdmin && (
              <Button
                variant="outline"
                onClick={async () => {
                  await openManageAccountModal({
                    clientUid: account.id,
                    roles: account.roles,
                    name: account.name ?? '',
                  });
                  await refetchApiAccounts();
                }}
              >
                Manage
              </Button>
            )}
          </>
        ),
      },
    ];

    const _data: TeamApiAccount[] = (apiAccounts ?? []).map((account) => {
      const rolesMapper = account.protocolMappers?.find((mapper) => mapper.name === 'roles');
      const rolesStr = _get(rolesMapper, ['config', 'claim.value'], '');

      return {
        name: account.name ?? '',
        roles: _compact(rolesStr.split(',')),
        id: account.id ?? '',
        clientId: account.clientId ?? '',
        secret: account.secret ?? '',
      };
    });

    return { data: _data, columns: _columns };
  }, [session, apiAccounts]);

  if (isApiAccountsLoading) {
    return null;
  }

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">Team API Accounts</h1>

      {session?.isAdmin && (
        <div className="text-right mb-2">
          <Button
            color="blue"
            onClick={async () => {
              await openCreateAccountModal({});
              await refetchApiAccounts();
            }}
          >
            Create
          </Button>
        </div>
      )}
      <DataTable<TeamApiAccount> data={tableData} columns={tableColumns} />
    </div>
  );
});
