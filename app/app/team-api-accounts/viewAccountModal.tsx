'use client';

import { Button, Divider, Grid, LoadingOverlay, Box, Pill, InputBase, List } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import CopyableButton from '@/components/generic/button/CopyableButton';
import Label from '@/components/generic/Label';
import { createModal } from '@/core/modal';
import { listKeycloakTeamApiAccountUsers } from '@/services/backend/keycloak';
import { useAppState } from '@/states/global';

interface ModalProps {
  clientUid: string;
  clientId: string;
  clientSecret: string;
  name: string;
  roles: string[];
}

interface ModalState {}

export const openViewAccountModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'View API Account',
  },
  Component: function ({ clientUid, clientId, clientSecret, name, roles, closeModal }) {
    const [, appSnap] = useAppState();

    const { data: users, isFetching: isUsersFetching } = useQuery({
      queryKey: ['users', clientUid],
      queryFn: () => listKeycloakTeamApiAccountUsers(clientUid),
    });

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isUsersFetching} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <Label htmlFor="name">Name</Label>
        <CopyableButton value={name}>{name}</CopyableButton>

        <Label htmlFor="account-roles" className="mt-2">
          API Account Roles
        </Label>
        <InputBase component="div" multiline>
          <Pill.Group>
            {roles.map((role) => (
              <Pill key={role}>{role}</Pill>
            ))}
          </Pill.Group>
        </InputBase>

        <Label htmlFor="member-email" className="mt-2">
          Member Email
        </Label>
        <List icon={<IconUser />}>
          {users && users.length > 0 ? (
            (users ?? []).map((user) => (
              <List.Item key={user.id}>
                <CopyableButton value={user.email}>{user.email}</CopyableButton>
              </List.Item>
            ))
          ) : (
            <List.Item key="empty">No members found.</List.Item>
          )}
        </List>

        <Label htmlFor="client-id" className="mt-2">
          Client ID
        </Label>
        <CopyableButton value={clientId}>{clientId}</CopyableButton>

        <Label htmlFor="client-secret" className="mt-2">
          Client Secret
        </Label>
        <CopyableButton value={clientSecret}>*************************</CopyableButton>

        <Label htmlFor="client-secret" className="mt-2">
          Token Endpoint
        </Label>
        <CopyableButton value={appSnap.info.TOKEN_URL}>{appSnap.info.TOKEN_URL}</CopyableButton>

        <Divider my="md" />

        <Grid>
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button color="gray" onClick={() => closeModal()} className="mr-1">
              Cancel
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    );
  },
  condition: (props: ModalProps) => !!props.clientUid,
  onClose: () => {},
});
