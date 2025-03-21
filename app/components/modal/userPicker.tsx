'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { User } from '@prisma/client';
import { IconInfoSquareFilled } from '@tabler/icons-react';
import { useState } from 'react';
import UserAutocomplete from '@/components/users/UserAutocomplete';
import { createModal } from '@/core/modal';

interface ModalProps {
  initialValue?: User | null;
}

interface ModalState {
  user?: User | null;
}

interface Warning {
  condition: boolean;
  message: string;
}

export const openUserPickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Search user',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ initialValue, state, closeModal }) {
    const [user, setUser] = useState<User | null>(initialValue && initialValue.id ? initialValue : null);
    const [autocompId, setAutocompId] = useState(randomId());

    const WarningMessage = ({ message }) => (
      <div className="mt-3">
        <IconInfoSquareFilled color="red" className="inline-block" />
        <span className="ml-2 text-red-500 font-bold">{message}</span>
      </div>
    );

    let warnings: Warning[] = [];

    if (user) {
      warnings = [
        { condition: !user.ministry, message: 'Please populate your account with your home ministry name' },
        {
          condition: !user.idir,
          message: 'Please populate your account with your Integrated Directory Identification and Resource (IDIR)',
        },
        { condition: !user.upn, message: 'Please populate your account with your User Principle Name (UPN)' },
      ];
    }

    return (
      <>
        <UserAutocomplete
          key={autocompId}
          onSelect={(item) => {
            setUser(item ?? null);
          }}
          initialValue={user}
        />

        {warnings
          .filter((warning) => warning.condition)
          .map((warning, index) => (
            <WarningMessage key={index} message={warning.message} />
          ))}

        <Divider my="md" />

        <Grid>
          <Grid.Col span={4}>
            <Button
              color="warning"
              onClick={() => {
                setUser(null);
                setAutocompId(randomId());
              }}
              className="mr-1"
            >
              Reset
            </Button>
          </Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button color="secondary" onClick={() => closeModal()} className="mr-1">
              Close
            </Button>

            <Button
              color="primary"
              disabled={!user?.idir || !user?.upn}
              className={!user?.idir || !user?.upn ? 'opacity-50 cursor-not-allowed' : ''}
              onClick={() => {
                state.user = user;
                closeModal();
              }}
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
