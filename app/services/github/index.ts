import axios from 'axios';
import { IS_LOCAL } from '@/config';
import { logger } from '@/core/logging';
import { GitHubApiUser, GitHubUser } from '@/types/user';
import { getGitHubInstallationToken } from './auth';
import { instance } from './axios';

export function processGitHubUser(user: GitHubApiUser): GitHubUser {
  return {
    accountId: String(user.id),
    username: user.login,
    displayName: user.name,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
  };
}

export async function isGitHubOrganizationMember(organization: string, username: string): Promise<boolean> {
  const token = await getGitHubInstallationToken(organization);

  const response = await instance.get<{ state: string }>(
    `/orgs/${encodeURIComponent(organization)}/memberships/${encodeURIComponent(username)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status: number) => status === 200 || status === 404,
    },
  );

  logger.info(`GitHub membership check: user="${username}", org="${organization}", status=${response.status}`);

  if (response.status === 404) {
    return false;
  }

  return response.data.state === 'active';
}

export async function getGitHubUser(username: string): Promise<GitHubUser | null> {
  const normalizedUsername = username.trim().replace(/^@/, '');

  try {
    const token = IS_LOCAL ? undefined : await getGitHubInstallationToken('bcgov');

    const response = await instance.get<GitHubApiUser>(`/users/${encodeURIComponent(normalizedUsername)}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    if (response.data.type !== 'User') {
      return null;
    }

    return processGitHubUser(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    const message = axios.isAxiosError(error) ? error.message : String(error);

    logger.error(`Error fetching GitHub user "${normalizedUsername}": ${message}`);

    throw error;
  }
}

const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export async function validateGitHubUsername(username: string) {
  const normalizedUsername = username.trim().toLowerCase().replace(/^@/, '');

  if (!githubUsernameRegex.test(normalizedUsername)) {
    return {
      valid: false as const,
      message: 'Enter a valid GitHub username.',
    };
  }

  const user = await getGitHubUser(normalizedUsername).catch(() => undefined);

  if (user === undefined) {
    return {
      valid: false as const,
      message: 'GitHub validation is temporarily unavailable. Please try again.',
    };
  }

  if (!user) {
    return {
      valid: false as const,
      message: 'GitHub user was not found.',
    };
  }

  if (IS_LOCAL) {
    return {
      valid: true as const,
      user,
    };
  }

  const approvedOrganizations = (process.env.GITHUB_APPROVED_ORGS || '')
    .split(',')
    .map((organization) => organization.trim())
    .filter(Boolean);

  if (approvedOrganizations.length === 0) {
    logger.error('No approved GitHub organizations are configured.');

    return {
      valid: false as const,
      message: 'GitHub validation is temporarily unavailable. Please try again.',
    };
  }

  try {
    for (const organization of approvedOrganizations) {
      const isMember = await isGitHubOrganizationMember(organization, user.username);

      if (isMember) {
        return {
          valid: true as const,
          user,
        };
      }
    }
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : String(error);

    logger.error(`GitHub organization membership validation failed: ${message}`);

    return {
      valid: false as const,
      message: 'GitHub validation is temporarily unavailable. Please try again.',
    };
  }

  return {
    valid: false as const,
    message: 'GitHub user must be a member of an approved GitHub organization.',
  };
}
