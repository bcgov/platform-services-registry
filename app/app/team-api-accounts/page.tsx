'use client';

import { Table, Badge, Button } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import _compact from 'lodash-es/compact';
import _get from 'lodash-es/get';
import createClientPage from '@/core/client-page';
import { listKeycloakTeamApiAccounts } from '@/services/backend/keycloak';
import { openCreateAccountModal } from './createAccountModal';
import { openManageAccountModal } from './manageAccountModal';
import { openViewAccountModal } from './viewAccountModal';

const TeamApiAccountsPage = createClientPage({
  roles: ['user'],
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

  if (isApiAccountsLoading) {
    return null;
  }

  let rows = null;
  if (!apiAccounts || apiAccounts.length === 0) {
    const message = session?.isAdmin ? 'No team API accounts found.' : 'You are not assigned to any team API accounts.';

    rows = (
      <Table.Tr>
        <Table.Td colSpan={3}>{message}</Table.Td>
      </Table.Tr>
    );
  } else {
    rows = (apiAccounts || []).map((account) => {
      const rolesMapper = account.protocolMappers?.find((mapper) => mapper.name === 'roles');
      const rolesStr = _get(rolesMapper, ['config', 'claim.value'], '');
      const roles: string[] = _compact(rolesStr.split(','));

      return (
        <Table.Tr key={account.id}>
          <Table.Td>
            <span className="whitespace-nowrap">{account.clientId}</span>
            <Badge color="green" radius="sm" className="ml-1">
              Active
            </Badge>
          </Table.Td>

          <Table.Td>
            {roles.map((role) => (
              <Badge key={role} color="gray" radius="sm" className="mr-1">
                {role}
              </Badge>
            ))}
          </Table.Td>
          <Table.Td>
            <Button
              className="mr-1"
              variant="outline"
              onClick={async () => {
                await openViewAccountModal({
                  clientUid: account.id!,
                  clientId: account.clientId!,
                  clientSecret: account.secret!,
                  roles,
                });
              }}
            >
              View
            </Button>
            {session?.isAdmin && (
              <Button
                variant="outline"
                onClick={async () => {
                  await openManageAccountModal({ clientUid: account.id!, roles });
                  await refetchApiAccounts();
                }}
              >
                Manage
              </Button>
            )}
          </Table.Td>
        </Table.Tr>
      );
    });
  }

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 pb-2">Team API Accounts</h1>

      {session?.isAdmin && (
        <div className="text-right">
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

      <Table striped verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Client ID</Table.Th>
            <Table.Th>Roles</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
});
