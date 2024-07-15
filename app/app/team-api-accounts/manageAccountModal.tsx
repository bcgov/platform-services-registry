'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { openConfirmModal } from '@/components/generic/modal/ConfirmModal';
import { createModal, ExtraModalProps } from '@/core/modal';
import { teamApiAccountSchema, TeamApiAccountSchemaData } from '@/schema';
import {
  listKeycloakAuthRoles,
  updateKeycloakApiTeamAccount,
  deleteKeycloakTeamApiAccount,
  listKeycloakTeamApiAccountUsers,
} from '@/services/backend/keycloak';
import AccountMembers from './AccountMembers';
import AccountRoles from './AccountRoles';

interface ModalProps {
  clientUid: string;
  roles: string[];
}

interface ModalState {}

function ManageAccountModal({ clientUid, roles, closeModal }: ModalProps & ExtraModalProps) {
  const { data: authRoles, isFetching: isAuthRolesFetching } = useQuery({
    queryKey: ['roles'],
    queryFn: () => listKeycloakAuthRoles(),
  });

  const { data: users, isFetching: isUsersFetching } = useQuery({
    queryKey: ['users', clientUid],
    queryFn: () => listKeycloakTeamApiAccountUsers(clientUid),
  });

  const methods = useForm({
    resolver: zodResolver(teamApiAccountSchema),
    defaultValues: {
      roles,
      users: [] as { email: string }[],
    },
  });

  const { mutateAsync: updateAccount, isPending: isUpdatingAccount } = useMutation({
    mutationFn: ({ roles: _roles, users: _users }: TeamApiAccountSchemaData) =>
      updateKeycloakApiTeamAccount(clientUid, _roles, _users),
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to update API account: ${error.message}`,
        color: 'red',
        autoClose: 5000,
      });
    },
  });

  const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: () => deleteKeycloakTeamApiAccount(clientUid),
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to delete API account: ${error.message}`,
        color: 'red',
        autoClose: 5000,
      });
    },
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (users) {
      setValue(
        'users',
        users.map((user) => ({ email: user.email! })),
      );
    }
  }, [users, setValue]);

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isAuthRolesFetching || isUsersFetching || isUpdatingAccount || isDeletingAccount}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <FormProvider {...methods}>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(async (formData) => {
            await updateAccount(formData);
            closeModal();
          })}
        >
          <AccountRoles allRoles={(authRoles ?? []).map((v) => v.name ?? '')} />
          <AccountMembers />

          <Divider my="md" />

          <Grid>
            <Grid.Col span={4}>
              <Button
                color="red"
                onClick={async () => {
                  const response = await openConfirmModal({});
                  if (response.confirmed) {
                    await deleteAccount();
                    closeModal();
                  }
                }}
                className="mr-1"
              >
                Delete
              </Button>
            </Grid.Col>
            <Grid.Col span={8} className="text-right">
              <Button color="gray" onClick={() => closeModal()} className="mr-1">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Grid.Col>
          </Grid>
        </form>
      </FormProvider>
    </Box>
  );
}

export const openManageAccountModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Manage API Account',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: ManageAccountModal,
  condition: (props: ModalProps) => !!props.clientUid,
  onClose: () => {},
});
