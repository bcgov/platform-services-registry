'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import { openConfirmModal } from '@/components/modal/confirm';
import { createModal } from '@/core/modal';
import {
  listKeycloakAuthRoles,
  updateKeycloakApiTeamAccount,
  deleteKeycloakTeamApiAccount,
  listKeycloakTeamApiAccountUsers,
} from '@/services/backend/keycloak';
import { teamApiAccountSchema, TeamApiAccount } from '@/validation-schemas/api-accounts';
import AccountMembers from './AccountMembers';

interface ModalProps {
  name: string;
  clientUid: string;
  roles: string[];
}

interface ModalState {}

export const openManageAccountModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Manage API Account',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ name, clientUid, roles, closeModal }) {
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
        name,
        roles,
        users: [] as { email: string }[],
      },
    });

    const { mutateAsync: updateAccount, isPending: isUpdatingAccount } = useMutation({
      mutationFn: ({ name: _name, roles: _roles, users: _users }: TeamApiAccount) =>
        updateKeycloakApiTeamAccount(clientUid, _name, _roles, _users),
    });

    const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useMutation({
      mutationFn: () => deleteKeycloakTeamApiAccount(clientUid),
    });

    const { handleSubmit, setValue, setError } = methods;

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
              const result = await updateAccount(formData);
              if (result.user.notfound.length === 0) {
                closeModal();
                return;
              }

              _forEach(result.user.notfound, (email) => {
                const ind = formData.users.findIndex((usr) => usr.email === email);
                if (ind > -1) {
                  setError(`users.${ind}.email`, {
                    type: 'manual',
                    message: 'The user does not exist in Keycloak.',
                  });
                }
              });
            })}
          >
            <HookFormTextInput label="Name" name="name" placeholder="Enter name..." required />
            <HookFormMultiSelect
              name="roles"
              label="API Account Roles"
              data={(authRoles ?? []).map((v) => v.name ?? '')}
              classNames={{ wrapper: 'mt-2' }}
            />
            <AccountMembers className="mt-2" />

            <Divider my="md" />

            <Grid>
              <Grid.Col span={4}>
                <Button
                  color="red"
                  onClick={async () => {
                    const res = await openConfirmModal({});
                    if (res.state.confirmed) {
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
  },
  condition: (props: ModalProps) => !!props.clientUid,
  onClose: () => {},
});
