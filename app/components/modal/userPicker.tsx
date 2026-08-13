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
    const [isSavingGitHub, setIsSavingGitHub] = useState(false);
    const [githubUsername, setGithubUsername] = useState(initialUser?.githubUsername ?? '');
    const [isEditingGitHub, setIsEditingGitHub] = useState(
      !initialUser?.githubUsername || !initialUser?.githubAccountId,
    );
    const [githubLookupUser, setGithubLookupUser] = useState<GitHubUser | null>(
      initialUser?.githubUsername && initialUser.githubAccountId
        ? {
            username: initialUser.githubUsername,
            accountId: initialUser.githubAccountId,
            displayName: null,
            avatarUrl: '',
            profileUrl: `https://github.com/${initialUser.githubUsername}`,
          }
        : null,
    );

    const [githubError, setGithubError] = useState('');

    const [isSearchingGitHub, setIsSearchingGitHub] = useState(false);

    const isBlacklisted = !!(user?.id && blacklistIds.includes(user.id));

    const profileWarnings: string[] = user
      ? [
          !user.ministry && 'Your home ministry name is missing',
          !user.idir && 'Your IDIR is missing',
          !user.upn && 'Your UPN is missing',
          (!user.idirGuid || !user.isGuidValid) && 'Your IDIR GUID is missing',
        ].filter((msg): msg is string => Boolean(msg))
      : [];

    const showIdirHelp = profileWarnings.length > 0;

    const warnings = [...profileWarnings];

    if (isBlacklisted && blacklistMessage) {
      warnings.push(blacklistMessage);
    }

    const hasEnteredGitHubUsername = githubUsername.trim().length > 0;

    const hasValidatedGitHubUsername = Boolean(user?.githubUsername && user.githubAccountId);

    const shouldDisableSelect = Boolean(
      !user?.idir ||
        !user?.upn ||
        isBlacklisted ||
        isSearchingGitHub ||
        isSavingGitHub ||
        (hasEnteredGitHubUsername && !hasValidatedGitHubUsername),
    );

    const resetGitHubState = (selectedUser: SearchedUser | null) => {
      setGithubUsername(selectedUser?.githubUsername ?? '');

      setGithubError('');

      const hasGitHubAccount = Boolean(selectedUser?.githubUsername && selectedUser.githubAccountId);
      setIsEditingGitHub(!hasGitHubAccount);
      if (selectedUser?.githubUsername && selectedUser.githubAccountId) {
        setGithubLookupUser({
          username: selectedUser.githubUsername,
          accountId: selectedUser.githubAccountId,
          displayName: null,
          avatarUrl: '',
          profileUrl: `https://github.com/${selectedUser.githubUsername}`,
        });
      } else {
        setGithubLookupUser(null);
      }
    };

    const searchGitHub = async () => {
      const normalizedUsername = githubUsername.trim().replace(/^@/, '');

      if (!normalizedUsername) {
        setGithubError('Enter a GitHub username.');
        return;
      }

      setIsSearchingGitHub(true);
      setGithubError('');
      setGithubLookupUser(null);

      const result = await validateGitHubUsername(normalizedUsername)
        .catch(() => ({
          valid: false as const,
          message: 'GitHub validation is temporarily unavailable.',
        }))
        .finally(() => {
          setIsSearchingGitHub(false);
        });

      setIsSearchingGitHub(false);

      if (!result.valid) {
        setGithubError(result.message);
        return;
      }

      const verifiedUsername = result.user.username.toLowerCase();

      setGithubUsername(verifiedUsername);
      setGithubLookupUser(result.user);

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,
          githubUsername: verifiedUsername,
          githubAccountId: result.user.accountId,
        };
      });
    };

    const selectUser = async () => {
      if (!user) {
        return;
      }

      setGithubError('');

      let selectedUser = user;

      const githubWasChanged =
        Boolean(user.githubUsername && user.githubAccountId) &&
        (user.githubUsername !== initialUser?.githubUsername || user.githubAccountId !== initialUser?.githubAccountId);

      if (githubWasChanged) {
        if (!user.id) {
          setGithubError('The Registry user must be saved before adding a GitHub account.');
          return;
        }

        setIsSavingGitHub(true);

        const result = await updateUserGitHub(user.id, user.githubUsername!);

        setIsSavingGitHub(false);
        if (!result.success) {
          setGithubError(result.message);
          setGithubUsername('');
          setGithubLookupUser(null);

          setUser((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              githubUsername: null,
              githubAccountId: null,
            };
          });

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
              resetGitHubState(selectedUser);
            }}
            initialValue={user}
          />
        )}

        {user && (isEditingGitHub || !user.githubUsername || !user.githubAccountId) && (
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
                value={githubUsername}
                error={githubError || undefined}
                disabled={isSearchingGitHub}
                className="flex-1"
                leftSection={<IconBrandGithub size={18} />}
                onChange={(event) => {
                  const value = event.currentTarget.value;

                  setGithubUsername(value);
                  setGithubError('');
                  setGithubLookupUser(null);
                  setUser((currentUser) =>
                    currentUser
                      ? {
                          ...currentUser,
                          githubUsername: null,
                          githubAccountId: null,
                        }
                      : currentUser,
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void searchGitHub();
                  }
                }}
              />

              <Button
                variant="outline"
                loading={isSearchingGitHub}
                disabled={!githubUsername.trim()}
                onClick={() => {
                  void searchGitHub();
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
                  <ExternalLink href={githubLookupUser?.profileUrl ?? `https://github.com/${user.githubUsername}`}>
                    {user.githubUsername}
                  </ExternalLink>
                </div>

                <div>GitHub account ID: {user.githubAccountId}</div>
              </div>

              {!isEditingGitHub && (
                <Tooltip label="Edit">
                  <IconEdit
                    className="ml-2 cursor-pointer edit-user-icon"
                    onClick={() => {
                      setGithubUsername(user.githubUsername ?? '');
                      setGithubError('');
                      setIsEditingGitHub(true);
                    }}
                  />
                </Tooltip>
              )}
              {githubLookupUser?.displayName && <div>Name: {githubLookupUser.displayName}</div>}
            </Group>
          </Alert>
        )}
        {githubError && user?.githubUsername && user.githubAccountId && <WarningMessage message={githubError} />}

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
                setGithubUsername('');
                setGithubLookupUser(null);
                setGithubError('');
                setIsSearchingGitHub(false);
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
              loading={isSavingGitHub}
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
