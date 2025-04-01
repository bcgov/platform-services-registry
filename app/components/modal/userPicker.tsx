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
  blacklistIds?: string[];
  blacklistMessage?: string;
}

interface ModalState {
  user?: SearchedUser | null;
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
  Component: function ({ initialValue, blacklistIds = [], blacklistMessage, state, closeModal }) {
    const [user, setUser] = useState<SearchedUser | null>(initialValue && initialValue.id ? initialValue : null);
    const [autocompId, setAutocompId] = useState(randomId());

    const isBlacklisted = !!(user?.id && blacklistIds.includes(user.id));

    const profileWarnings: string[] = user
      ? [
          !user.ministry && 'Your home ministry name is missing',
          !user.idir && 'Your IDIR is missing',
          !user.upn && 'Your UPN is missing',
        ].filter((msg): msg is string => Boolean(msg))
      : [];

    const showIdirHelp = profileWarnings.length > 0;

    const warnings = [...profileWarnings];

    if (isBlacklisted && blacklistMessage) {
      warnings.push(blacklistMessage);
    }

    const shouldDisableSelect = !!(!user?.idir || !user?.upn || isBlacklisted);

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
          return <WarningMessage key={index} message={warning} />;
        })}

        {showIdirHelp && (
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
