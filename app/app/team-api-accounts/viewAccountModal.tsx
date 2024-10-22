'use client';

import { Button, Divider, Grid, LoadingOverlay, Box, Pill, InputBase, List } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { createModal } from '@/core/modal';
import { listKeycloakTeamApiAccountUsers } from '@/services/backend/keycloak';

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
    const { data: users, isFetching: isUsersFetching } = useQuery({
      queryKey: ['users', clientUid],
      queryFn: () => listKeycloakTeamApiAccountUsers(clientUid),
    });

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isUsersFetching} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">Name</div>
        <CopyableButton value={name}>{name}</CopyableButton>

        <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">API Account Roles</div>
        <InputBase component="div" multiline>
          <Pill.Group>
            {roles.map((role) => (
              <Pill key={role}>{role}</Pill>
            ))}
          </Pill.Group>
        </InputBase>

        <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">Member Emails</div>
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

        <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">Client ID</div>
        <CopyableButton value={clientId}>{clientId}</CopyableButton>

        <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">Client Secret</div>
        <CopyableButton value={clientSecret}>*************************</CopyableButton>

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
