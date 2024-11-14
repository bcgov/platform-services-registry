'use client';

import { Button, Divider, Grid, Box } from '@mantine/core';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _sortBy from 'lodash-es/sortBy';
import _startCase from 'lodash-es/startCase';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import { createModal } from '@/core/modal';
import ProfileImage from '../ProfileImage';

interface ModalProps {
  session: Session;
}

interface ModalState {}

const formatWords = (arr: string[]) => _sortBy(_uniq(_compact(_castArray(arr)))).map(_startCase);

export const openUserProfileModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: '',
    withCloseButton: true,
    closeOnClickOutside: true,
    closeOnEscape: true,
  },
  Component: function ({ session, closeModal }) {
    const allowedPermissions = Object.keys(session.permissions).filter(
      (key) => session.permissions[key as keyof typeof session.permissions],
    );

    const roles = formatWords(session.roles);
    const permissions = formatWords(allowedPermissions);

    return (
      <Box pos="relative">
        <div>
          <ProfileImage
            email={session.user.email ?? ''}
            image={session.user.image ?? ''}
            size={400}
            className="h-20 w-20 mx-auto mb-2"
          />
        </div>

        <div className="text-center text-xl leading-6 font-bold text-gray-900 mb-2">{session.user.name}</div>
        <div className="text-center text-lg mb-3">{session.user.email}</div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 text-gray-500 mb-3 max-w-lg mx-auto">
          <div className="col-span-1">
            <div className="font-bold">Roles:</div>
            <ul className="list-disc text-sm">
              {roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            <div className="font-bold">Permissions:</div>
            <ul className="list-disc text-sm">
              {permissions.map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
          </div>
        </div>

        <Divider my="md" />

        <Grid className="mt-2">
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button
              color="secondary"
              onClick={() => {
                closeModal();
              }}
              className="mr-1"
            >
              Cancel
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    );
  },
  onClose: () => {},
  condition: (props) => !!props.session,
});
