import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProps {
  firstName: string | null;
  githubUsername: string;
  previousGithubUsername: string | null;
  updatedBy: string;
}

export default function GitHubAccountUpdated({
  firstName,
  githubUsername,
  previousGithubUsername,
  updatedBy,
}: EmailProps) {
  const message = previousGithubUsername ? 'changed your GitHub username in' : 'added your GitHub username to';

  return (
    <Layout>
      <Heading className="text-lg">GitHub account updated</Heading>

      <Text>Hi {firstName || 'there'},</Text>

      <Text>
        {updatedBy} {message} your Platform Services Product Registry profile.
      </Text>

      {previousGithubUsername && (
        <Text>
          Previous GitHub username: <strong>{previousGithubUsername}</strong>
        </Text>
      )}

      <Text>
        Current GitHub username: <strong>{githubUsername}</strong>
      </Text>

      <Button href={`https://github.com/${githubUsername}`} className="rounded-md bg-yellow-500 px-4 py-2 text-white">
        View GitHub profile
      </Button>

      <Text>If this information is incorrect, please contact your product team.</Text>
    </Layout>
  );
}
