'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { User } from '@prisma/client';
import { useState } from 'react';
import UserAutocomplete from '@/components/users/UserAutocomplete';
import { createModal } from '@/core/modal';

interface ModalProps {}

interface ModalState {
  user?: User;
}

export const openUserPickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Search user',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ state, closeModal }) {
    const [user, setUser] = useState<User>();

    return (
      <>
        <UserAutocomplete
          onSelect={(item) => {
            setUser(item);
          }}
        />

        <Divider my="md" />

        <Grid>
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button color="secondary" onClick={() => closeModal()} className="mr-1">
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => {
                state.user = user;
                closeModal();
              }}
              disabled={!user}
            >
              Select
            </Button>
          </Grid.Col>
        </Grid>
      </>
    );
  },
  onClose: () => {},
});
