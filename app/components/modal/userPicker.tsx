'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { User } from '@prisma/client';
import { IconInfoSquareFilled } from '@tabler/icons-react';
import { useState } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
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

function WarningMessage({ message }) {
  return (
    <div className="mt-3">
      <IconInfoSquareFilled color="red" className="inline-block" />
      <span className="ml-2 text-red-500 font-bold">{message}</span>
    </div>
  );
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

    let warnings: Warning[] = [];

    let hasIdirError = false;

    if (user) {
      warnings = [
        { condition: !user.ministry, message: 'Your home ministry name is missing' },
        {
          condition: !user.idir,
          message: 'Your IDIR is missing',
        },
        { condition: !user.upn, message: 'Your UPN is missing' },
      ];
    }

    const hasUpnOrIdir = !user?.idir || !user?.upn;

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
          .map((warning, index) => {
            hasIdirError = true;
            return <WarningMessage key={index} message={warning.message} />;
          })}

        {hasIdirError && (
          <div className="mt-5">
            <span>Please visit this page to update your missing profile information: </span>
            <ExternalLink href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services">
              IDIR Services - Government of BC
            </ExternalLink>
          </div>
        )}

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
              disabled={hasUpnOrIdir}
              className={hasUpnOrIdir ? 'opacity-50 cursor-not-allowed' : ''}
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
