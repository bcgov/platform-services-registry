import 'server-only';

import { createAppAuth } from '@octokit/auth-app';

let auth: ReturnType<typeof createAppAuth> | undefined;

function getAppAuth() {
  if (auth) {
    return auth;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('GitHub App authentication is not configured.');
  }

  auth = createAppAuth({
    appId,
    privateKey,
  });

  return auth;
}

function getInstallationId(organization: string): number {
  const installationIds: Record<string, string | undefined> = {
    bcgov: process.env.GITHUB_BCGOV_INSTALLATION_ID,
    'bcgov-c': process.env.GITHUB_BCGOV_C_INSTALLATION_ID,
  };

  const installationId = installationIds[organization];

  if (!installationId) {
    throw new Error(`GitHub App installation ID is not configured for organization "${organization}".`);
  }

  const parsedInstallationId = Number(installationId);

  if (!Number.isSafeInteger(parsedInstallationId) || parsedInstallationId <= 0) {
    throw new TypeError(`GitHub App installation ID is invalid for organization "${organization}".`);
  }

  return parsedInstallationId;
}

export async function getGitHubInstallationToken(organization: string): Promise<string> {
  const authentication = await getAppAuth()({
    type: 'installation',
    installationId: getInstallationId(organization),
  });

  return authentication.token;
}
