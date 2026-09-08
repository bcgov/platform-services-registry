import { logger } from '@/core/logging';
import { sendGitHubAccountUpdated } from './emails';

export interface GitHubAccountUpdatedEmailData {
  email: string;
  firstName: string | null;
  githubUsername: string | null;
  previousGithubUsername: string | null;
  updatedBy: string;
}

export async function sendGitHubAccountUpdatedEmail(data: GitHubAccountUpdatedEmailData) {
  try {
    return await sendGitHubAccountUpdated(data);
  } catch (error) {
    logger.error('sendGitHubAccountUpdatedEmail:', error);

    return null;
  }
}
