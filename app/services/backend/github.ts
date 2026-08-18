import axios from 'axios';
import { GitHubUserValidationResult, UpdatedGitHubUser } from '@/types/user';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/github`,
});

export async function validateGitHubUsername(username: string) {
  return instance
    .get<GitHubUserValidationResult>('/search', {
      params: {
        username,
      },
    })
    .then((response) => response.data);
}

export interface ApiErrorResponse {
  success: false;
  message?: unknown;
  error?: unknown;
}

export type UpdateUserGitHubResult =
  | {
      success: true;
      user: UpdatedGitHubUser;
    }
  | {
      success: false;
      message: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getApiErrorMessage(response: ApiErrorResponse): string {
  if (typeof response.error === 'string') {
    return response.error;
  }

  if (isRecord(response.error) && typeof response.error['message'] === 'string') {
    return response.error['message'];
  }

  if (typeof response.message === 'string') {
    return response.message;
  }

  return 'Unable to save the GitHub account.';
}

export async function updateUserGitHub(userId: string, username: string): Promise<UpdateUserGitHubResult> {
  const response = await baseInstance
    .patch<UpdatedGitHubUser | ApiErrorResponse>(
      `/users/${userId}`,
      {
        username,
      },
      {
        validateStatus: () => true,
      },
    )
    .catch(() => null);

  if (!response) {
    return {
      success: false,
      message: 'Unable to save the GitHub account.',
    };
  }

  if (response.status >= 400) {
    return {
      success: false,
      message: getApiErrorMessage(response.data as ApiErrorResponse),
    };
  }

  return {
    success: true,
    user: response.data as UpdatedGitHubUser,
  };
}
