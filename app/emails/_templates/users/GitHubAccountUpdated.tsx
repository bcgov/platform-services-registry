import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Layout from '@/emails/_components/layout/Layout';
import type { GitHubAccountUpdatedEmailData } from '@/services/ches/users';

export default function GitHubAccountUpdated({
  firstName,
  githubUsername,
  previousGithubUsername,
  updatedBy,
}: Readonly<Omit<GitHubAccountUpdatedEmailData, 'email'>>) {
  const wasRemoved = githubUsername === null;

  const message = wasRemoved
    ? 'removed your GitHub username from'
    : previousGithubUsername
      ? 'changed your GitHub username in'
      : 'added your GitHub username to';

  return (
    <Layout>
      <Heading className="text-lg">{wasRemoved ? 'GitHub account removed' : 'GitHub account updated'}</Heading>

      <Text>Hi {firstName || 'there'},</Text>

      <Text>
        {updatedBy} {message} your Platform Services Registry profile.
      </Text>

      {previousGithubUsername && (
        <Text>
          Previous GitHub username: <strong>{previousGithubUsername}</strong>
        </Text>
      )}

      {!wasRemoved && (
        <>
          <Text>
            Current GitHub username: <strong>{githubUsername}</strong>
          </Text>

          <Button
            href={`https://github.com/${encodeURIComponent(githubUsername)}`}
            className="bg-bcorange rounded-md px-4 py-2 text-white"
          >
            View GitHub profile
          </Button>
        </>
      )}
      <Text>If this information is incorrect, please contact your product team.</Text>
    </Layout>
  );
}
