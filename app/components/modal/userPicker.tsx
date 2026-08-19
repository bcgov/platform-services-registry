'use client';

import { Alert, Button, Divider, Grid, Group, TextInput, Tooltip } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { IconBrandGithub, IconEdit, IconInfoSquareFilled } from '@tabler/icons-react';
import { useState } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import UserAutocomplete from '@/components/users/UserAutocomplete';
import { createModal } from '@/core/modal';
import { updateUserGitHub, validateGitHubUsername } from '@/services/backend/github';
import { GitHubUser, SearchedUser } from '@/types/user';
import { cn } from '@/utils/js';
import UserProfile from '../users/UserProfile';

interface ModalProps {
  initialValue?: SearchedUser | null;
  blacklistIds?: string[];
  blacklistMessage?: string;
  userReadonly?: boolean;
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

function useGitHubUser(
  initialUser: SearchedUser | null,
  setUser: React.Dispatch<React.SetStateAction<SearchedUser | null>>,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [username, setUsername] = useState(initialUser?.githubUsername ?? '');
  const [error, setError] = useState('');
  const [lookupUser, setLookupUser] = useState<GitHubUser | null>(null);
  const [isEditing, setIsEditing] = useState(!initialUser?.githubUsername || !initialUser.githubAccountId);

  const [originalUsername, setOriginalUsername] = useState<string | null>(initialUser?.githubUsername ?? null);

  const [originalAccountId, setOriginalAccountId] = useState<string | null>(initialUser?.githubAccountId ?? null);

  const hadInitialGitHubData = Boolean(originalUsername || originalAccountId);
  const reset = (selectedUser: SearchedUser | null) => {
    const selectedUsername = selectedUser?.githubUsername ?? null;
    const selectedAccountId = selectedUser?.githubAccountId ?? null;
    const hasAccount = Boolean(selectedUsername && selectedAccountId);

    setOriginalUsername(selectedUsername);
    setOriginalAccountId(selectedAccountId);
    setUsername(selectedUsername ?? '');
    setError('');
    setIsEditing(!hasAccount);

    if (selectedUsername && selectedAccountId) {
      setLookupUser({
        username: selectedUsername,
        accountId: selectedAccountId,
        displayName: null,
        avatarUrl: '',
        profileUrl: `https://github.com/${encodeURIComponent(selectedUsername)}`,
      });
    } else {
      setLookupUser(null);
    }
  };

  const changeUsername = (value: string) => {
    setUsername(value);
    setLookupUser(null);

    setError(
      hadInitialGitHubData && !value.trim()
        ? 'A GitHub account cannot be removed. Enter and validate a replacement username.'
        : '',
    );

    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            githubUsername: null,
            githubAccountId: null,
          }
        : currentUser,
    );
  };

  const search = async () => {
    const normalizedUsername = username.trim().replace(/^@/, '');

    if (!normalizedUsername) {
      setError('Enter a GitHub username.');
      return;
    }

    setIsSearching(true);
    setError('');
    setLookupUser(null);

    const result = await validateGitHubUsername(normalizedUsername)
      .catch(() => ({
        valid: false as const,
        message: 'GitHub validation is temporarily unavailable.',
      }))
      .finally(() => setIsSearching(false));

    if (!result.valid) {
      setError(result.message);
      return;
    }

    const verifiedUsername = result.user.username.toLowerCase();

    setUsername(verifiedUsername);
    setLookupUser(result.user);

    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            githubUsername: verifiedUsername,
            githubAccountId: result.user.accountId,
          }
        : currentUser,
    );
  };

  const clearCandidate = () => {
    setUsername('');
    setLookupUser(null);

    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            githubUsername: null,
            githubAccountId: null,
          }
        : currentUser,
    );
  };

  return {
    username,
    error,
    lookupUser,
    isEditing,
    isSaving,
    isSearching,
    originalUsername,
    originalAccountId,
    setError,
    setIsEditing,
    setIsSaving,
    reset,
    search,
    changeUsername,
    clearCandidate,
    hadInitialGitHubData,
  };
}

function getProfileWarnings(user: SearchedUser | null): string[] {
  if (!user) {
    return [];
  }

  return [
    !user.ministry && 'Your home ministry name is missing',
    !user.idir && 'Your IDIR is missing',
    !user.upn && 'Your UPN is missing',
    (!user.idirGuid || !user.isGuidValid) && 'Your IDIR GUID is missing',
  ].filter((message): message is string => Boolean(message));
}

export const openUserPickerModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Search user',
    classNames: {
      content: 'overflow-y-visible',
    },
  },
  Component: function ({ initialValue, blacklistIds = [], blacklistMessage, state, closeModal, userReadonly = false }) {
    const initialUser = initialValue?.id ? initialValue : null;
    const [user, setUser] = useState<SearchedUser | null>(initialUser);
    const [autocompId, setAutocompId] = useState(randomId());
    const github = useGitHubUser(initialUser, setUser);

    const isBlacklisted = !!(user?.id && blacklistIds.includes(user.id));

    const profileWarnings = getProfileWarnings(user);

    const showIdirHelp = profileWarnings.length > 0;

    const warnings = [...profileWarnings];

    if (isBlacklisted && blacklistMessage) {
      warnings.push(blacklistMessage);
    }
    const hasEnteredGitHubUsername = github.username.trim().length > 0;

    const hasValidatedGitHubUsername = Boolean(user?.githubUsername && user.githubAccountId);

    const isClearingExistingGitHubAccount =
      github.hadInitialGitHubData && github.isEditing && !hasEnteredGitHubUsername;

    const shouldDisableSelect = Boolean(
      !user?.idir ||
        !user?.upn ||
        isBlacklisted ||
        github.isSearching ||
        github.isSaving ||
        isClearingExistingGitHubAccount ||
        (hasEnteredGitHubUsername && !hasValidatedGitHubUsername),
    );

    const selectUser = async () => {
      if (!user) {
        return;
      }

      github.setError('');

      let selectedUser = user;
      if (github.hadInitialGitHubData && github.isEditing && (!user.githubUsername || !user.githubAccountId)) {
        github.setError('Enter and validate a new GitHub username, or close the editor to keep the existing account.');
        return;
      }
      const githubWasChanged =
        Boolean(user.githubUsername && user.githubAccountId) &&
        (user.githubUsername !== github.originalUsername || user.githubAccountId !== github.originalAccountId);
      if (githubWasChanged) {
        if (!user.id) {
          github.setError('The Registry user must be saved before adding a GitHub account.');
          return;
        }

        github.setIsSaving(true);

        const result = await updateUserGitHub(user.id, user.githubUsername!).finally(() => {
          github.setIsSaving(false);
        });

        if (!result.success) {
          github.setError(result.message);
          github.clearCandidate();
          return;
        }

        selectedUser = {
          ...user,
          githubUsername: result.user.githubUsername,
          githubAccountId: result.user.githubAccountId,
        };
      }

      state.user = selectedUser;
      closeModal();
    };

    return (
      <>
        {userReadonly && user ? (
          <UserProfile data={user} />
        ) : (
          <UserAutocomplete
            key={autocompId}
            onSelect={(selectedUser: SearchedUser | null = null) => {
              setUser(selectedUser);
              github.reset(selectedUser);
            }}
            initialValue={user}
          />
        )}

        {user && (github.isEditing || !user.githubUsername || !user.githubAccountId) && (
          <div className="mt-4">
            <Group align="flex-end">
              <TextInput
                label="GitHub username"
                description={
                  <span>
                    This field is optional. Enter the GitHub username only. Do not include the @ symbol or the GitHub
                    profile URL. If you don&apos;t know your username, review{' '}
                    <ExternalLink href="https://docs.github.com/en/account-and-profile/how-tos/email-preferences/remembering-your-github-username-or-email">
                      these guidelines
                    </ExternalLink>
                    .
                  </span>
                }
                placeholder="For example: octocat"
                value={github.username}
                error={github.error || undefined}
                disabled={github.isSearching}
                className="flex-1"
                leftSection={<IconBrandGithub size={18} />}
                onChange={(event) => {
                  github.changeUsername(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void github.search();
                  }
                }}
              />

              <Button
                variant="outline"
                loading={github.isSearching}
                disabled={!github.username.trim()}
                onClick={() => {
                  void github.search();
                }}
              >
                Look up
              </Button>
            </Group>
          </div>
        )}

        {user?.githubUsername && user.githubAccountId && (
          <Alert color="green" icon={<IconBrandGithub size={20} />} className="mt-4" title="GitHub account verified">
            <Group justify="space-between">
              <div>
                <div>
                  Username:{' '}
                  <ExternalLink
                    href={
                      github.lookupUser?.profileUrl ?? `https://github.com/${encodeURIComponent(user.githubUsername)}`
                    }
                  >
                    {user.githubUsername}
                  </ExternalLink>
                </div>

                <div>GitHub account ID: {user.githubAccountId}</div>
              </div>

              {!github.isEditing && (
                <Tooltip label="Edit">
                  <IconEdit
                    className="ml-2 cursor-pointer edit-user-icon"
                    onClick={() => {
                      github.setError('');
                      github.setIsEditing(true);
                    }}
                  />
                </Tooltip>
              )}
              {github.lookupUser?.displayName && <div>Name: {github.lookupUser.displayName}</div>}
            </Group>
          </Alert>
        )}
        {github.error && user?.githubUsername && user.githubAccountId && <WarningMessage message={github.error} />}

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
                if (userReadonly) {
                  setUser(initialUser);
                  github.reset(initialUser);
                  return;
                }
                setUser(null);
                setAutocompId(randomId());
                github.reset(null);
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
              loading={github.isSaving}
              disabled={shouldDisableSelect}
              className={cn({ 'opacity-50 cursor-not-allowed': shouldDisableSelect })}
              onClick={() => {
                void selectUser();
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
