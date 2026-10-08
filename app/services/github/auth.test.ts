import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockAuth = jest.fn<(options: { type: 'installation'; installationId: number }) => Promise<{ token: string }>>();

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn(() => mockAuth),
}));

describe('GitHub App authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env = {
      ...originalEnv,
      GITHUB_APP_ID: '123',
      GITHUB_APP_PRIVATE_KEY: 'test-private-key', // pragma: allowlist secret
      GITHUB_BCGOV_INSTALLATION_ID: '111',
      GITHUB_BCGOV_C_INSTALLATION_ID: '222',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return an installation token for bcgov', async () => {
    mockAuth.mockResolvedValue({
      token: 'bcgov-token',
    });

    const { getGitHubInstallationToken } = await import('./auth');

    const token = await getGitHubInstallationToken('bcgov');

    expect(token).toBe('bcgov-token');

    expect(mockAuth).toHaveBeenCalledWith({
      type: 'installation',
      installationId: 111,
    });
  });

  it('should use the bcgov-c installation ID', async () => {
    mockAuth.mockResolvedValue({
      token: 'bcgov-c-token',
    });

    const { getGitHubInstallationToken } = await import('./auth');

    await getGitHubInstallationToken('bcgov-c');

    expect(mockAuth).toHaveBeenCalledWith({
      type: 'installation',
      installationId: 222,
    });
  });

  it('should fail when GitHub App credentials are missing', async () => {
    delete process.env.GITHUB_APP_ID;

    const { getGitHubInstallationToken } = await import('./auth');

    await expect(getGitHubInstallationToken('bcgov')).rejects.toThrow('GitHub App authentication is not configured.');
  });

  it('should fail when the installation ID is missing', async () => {
    delete process.env.GITHUB_BCGOV_INSTALLATION_ID;

    const { getGitHubInstallationToken } = await import('./auth');

    await expect(getGitHubInstallationToken('bcgov')).rejects.toThrow(
      'GitHub App installation ID is not configured for organization "bcgov".',
    );
  });

  it('should throw TypeError when the installation ID is invalid', async () => {
    process.env.GITHUB_BCGOV_INSTALLATION_ID = 'invalid';

    const { getGitHubInstallationToken } = await import('./auth');

    await expect(getGitHubInstallationToken('bcgov')).rejects.toThrow(TypeError);
  });
});
