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

function getApprovedOrganizations(): string[] {
  return (process.env.GITHUB_APPROVED_ORGS || '')
    .split(',')
    .map((organization) => organization.trim())
    .filter(Boolean);
}

async function getGitHubUserByToken(normalizedUsername: string, token?: string): Promise<GitHubApiUser | null> {
  try {
    const response = await instance.get<GitHubApiUser>(
      `/users/${encodeURIComponent(normalizedUsername)}`,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

async function getGitHubUserResponse(normalizedUsername: string): Promise<GitHubApiUser | null> {
  if (IS_LOCAL) {
    return getGitHubUserByToken(normalizedUsername);
  }

  const approvedOrganizations = getApprovedOrganizations();

  for (const organization of approvedOrganizations) {
    try {
      const token = await getGitHubInstallationToken(organization);

      return await getGitHubUserByToken(normalizedUsername, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      logger.warn(`GitHub user lookup failed using "${organization}" installation: ${message}`);
    }
  }

  throw new Error('GitHub user lookup failed for all approved organization installations.');
}

export async function getGitHubUser(username: string): Promise<GitHubUser | null> {
  const normalizedUsername = username.trim().replace(/^@/, '');

  try {
    const user = await getGitHubUserResponse(normalizedUsername);

    if (user?.type !== 'User') {
      return null;
    }

    return processGitHubUser(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

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

  const approvedOrganizations = getApprovedOrganizations();

  if (approvedOrganizations.length === 0) {
    logger.error('No approved GitHub organizations are configured.');

    return {
      valid: false as const,
      message: 'GitHub validation is temporarily unavailable. Please try again.',
    };
  }

  let membershipCheckSucceeded = false;

  for (const organization of approvedOrganizations) {
    try {
      const isMember = await isGitHubOrganizationMember(organization, user.username);

      membershipCheckSucceeded = true;

      if (isMember) {
        return {
          valid: true as const,
          user,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      logger.warn(`GitHub membership check failed for "${organization}": ${message}`);
    }
  }

  if (!membershipCheckSucceeded) {
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
