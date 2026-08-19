import axios from 'axios';
import { logger } from '@/core/logging';
import { GitHubApiUser, GitHubUser } from '@/types/user';
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

export async function getGitHubUser(username: string): Promise<GitHubUser | null> {
  const normalizedUsername = username.trim().replace(/^@/, '');

  try {
    const response = await instance.get<GitHubApiUser>(`/users/${encodeURIComponent(normalizedUsername)}`);

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

  return {
    valid: true as const,
    user,
  };
}
