'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { createModal } from '@/core/modal';
import { listKeycloakAuthRoles, createKeycloakTeamApiAccount } from '@/services/backend/keycloak';
import { teamApiAccountSchema, TeamApiAccount } from '@/validation-schemas/api-accounts';
import AccountMembers from './AccountMembers';
import AccountRoles from './AccountRoles';

interface ModalProps {}
interface ModalState {}

export const openCreateAccountModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Create API Account',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ closeModal }) {
    const [isServerError, setIsServerError] = useState(false);
    const { data: authRoles, isFetching: isAuthRolesFetching } = useQuery({
      queryKey: ['roles'],
      queryFn: () => listKeycloakAuthRoles(),
    });

    const methods = useForm({
      resolver: zodResolver(teamApiAccountSchema),
      defaultValues: {
        name: '',
        roles: [],
        users: [] as { email: string }[],
      },
    });

    const { mutateAsync: createAccount, isPending: isCreatinAccount } = useMutation({
      mutationFn: ({ name, roles, users }: TeamApiAccount) => createKeycloakTeamApiAccount(name, roles, users),
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: `Failed to create API account: ${error.message}`,
          color: 'red',
          autoClose: 5000,
        });
      },
    });

    const { handleSubmit, setError } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay
          visible={isAuthRolesFetching || isCreatinAccount}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              const result = await createAccount(formData);
              if (!result.client) {
                notifications.show({
                  title: 'Error',
                  message: `Failed to create API account`,
                  color: 'red',
                  autoClose: 5000,
                });

                return;
              }

              notifications.show({
                color: 'green',
                title: 'Success',
                message: 'Account created successfully',
                autoClose: 5000,
              });

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

              setIsServerError(true);
            })}
          >
            <HookFormTextInput label="Name" name="name" placeholder="Enter name..." required />
            <AccountRoles allRoles={(authRoles ?? []).map((v) => v.name ?? '')} disabled={isServerError} />
            <AccountMembers disabled={isServerError} />

            <Divider my="md" />

            <Grid>
              <Grid.Col span={4}></Grid.Col>
              <Grid.Col span={8} className="text-right">
                <Button color="gray" onClick={() => closeModal()} className="mr-1">
                  {isServerError ? 'Close' : 'Cancel'}
                </Button>
                {!isServerError && <Button type="submit">Save</Button>}
              </Grid.Col>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    );
  },
  onClose: () => {},
});
