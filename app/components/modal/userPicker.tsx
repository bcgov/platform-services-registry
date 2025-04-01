'use client';

import { Button, Divider, Grid } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { IconInfoSquareFilled } from '@tabler/icons-react';
import { useState } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import UserAutocomplete from '@/components/users/UserAutocomplete';
import { createModal } from '@/core/modal';
import { SearchedUser } from '@/types/user';
import { cn } from '@/utils/js';

interface ModalProps {
  initialValue?: SearchedUser | null;
}

interface ModalState {
  user?: SearchedUser | null;
  users?: SearchedUser[] | null;
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

const isUserDuplicate = (
  users: Array<{ id?: string | null } | null | undefined>,
  userId: string | undefined | null,
) => {
  if (!userId) return false;

  const matchingCount = users.reduce((count, user) => {
    return user?.id === userId ? count + 1 : count;
  }, 0);

  return matchingCount > 1;
};

export const openUserPickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Search user',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ initialValue, state, closeModal }) {
    const [user, setUser] = useState<SearchedUser | null>(initialValue && initialValue.id ? initialValue : null);
    const [autocompId, setAutocompId] = useState(randomId());

    let warnings: Warning[] = [];

    if (user) {
      warnings = [
        { condition: !user.ministry, message: 'Your home ministry name is missing' },
        {
          condition: !user.idir,
          message: 'Your IDIR is missing',
        },
        { condition: !user.upn, message: 'Your UPN is missing' },
      ].filter((warning) => warning.condition);
    }

    let isDuplicateUser = false;

    if (state.users && user?.id) {
      const currentUsers = state.users.filter(Boolean);
      const simulatedUsers = [...currentUsers, user];
      isDuplicateUser = isUserDuplicate(simulatedUsers, user.id);
    }

    if (isDuplicateUser) {
      warnings.push({
        condition: true,
        message: 'Each role must be assigned to a unique person',
      });
    }

    const shouldDisableSelect = !user?.idir || !user?.upn || isDuplicateUser;

    return (
      <>
        <UserAutocomplete
          key={autocompId}
          onSelect={(item) => {
            setUser(item ?? null);
          }}
          initialValue={user}
        />

        {warnings.map((warning, index) => {
          return <WarningMessage key={index} message={warning.message} />;
        })}

        {warnings.length > 0 && (
          <div className="mt-5">
            <span>
              {isDuplicateUser &&
                warnings.length > 1 &&
                'This user is already assigned to another role and also has missing profile information.'}
            </span>
            {(!isDuplicateUser || warnings.length > 1) && (
              <span>
                This user has missing profile information. Please update their details here:{' '}
                <ExternalLink href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services">
                  IDIR Services - Government of BC
                </ExternalLink>
              </span>
            )}
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
              disabled={shouldDisableSelect}
              className={cn({ 'opacity-50 cursor-not-allowed': shouldDisableSelect })}
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
