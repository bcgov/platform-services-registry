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
  message: string;
  error?: string;
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

export async function updateUserGitHub(userId: string, username: string): Promise<UpdateUserGitHubResult> {
  const response = await baseInstance.patch<UpdatedGitHubUser | ApiErrorResponse>(
    `/users/${userId}`,
    {
      username,
    },
    {
      validateStatus: () => true,
    },
  );

  if (response.status >= 400) {
    const error = response.data as ApiErrorResponse;

    return {
      success: false,
      message: error.error ?? error.message ?? 'Unable to save the GitHub account.',
    };
  }

  return {
    success: true,
    user: response.data as UpdatedGitHubUser,
  };
}
