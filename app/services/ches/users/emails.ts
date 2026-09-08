import GitHubAccountUpdatedTemplate from '@/emails/_templates/users/GitHubAccountUpdated';
import { sendEmail } from '@/services/ches/core';
import { getContent } from '@/services/ches/helpers';
import type { GitHubAccountUpdatedEmailData } from '.';

export async function sendGitHubAccountUpdated({
  email,
  firstName,
  githubUsername,
  previousGithubUsername,
  updatedBy,
}: GitHubAccountUpdatedEmailData) {
  const content = await getContent(
    GitHubAccountUpdatedTemplate({
      firstName,
      githubUsername,
      previousGithubUsername,
      updatedBy,
    }),
  );

  return sendEmail({
    subject: 'Your GitHub username was updated in the Platform Services Registry',
    to: [email],
    body: content,
  });
}
