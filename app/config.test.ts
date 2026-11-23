describe('NATS credentials configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();

    process.env = { ...originalEnv };

    delete process.env.PRIVATE_NATS_USERNAME;
    delete process.env.PRIVATE_NATS_PASSWORD;
    delete process.env.PUBLIC_NATS_USERNAME;
    delete process.env.PUBLIC_NATS_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows missing credentials for both Private and Public Cloud', () => {
    expect(() => require('./config')).not.toThrow();
  });

  it('allows valid credentials for both Private and Public Cloud', () => {
    process.env.PRIVATE_NATS_USERNAME = 'private-user';
    process.env.PRIVATE_NATS_PASSWORD = 'private-password'; // pragma: allowlist secret
    process.env.PUBLIC_NATS_USERNAME = 'public-user';
    process.env.PUBLIC_NATS_PASSWORD = 'public-password'; // pragma: allowlist secret

    expect(() => require('./config')).not.toThrow();
  });

  it.each([
    ['username', 'PRIVATE_NATS_USERNAME', 'Private Cloud'],
    ['password', 'PRIVATE_NATS_PASSWORD', 'Private Cloud'],
    ['username', 'PUBLIC_NATS_USERNAME', 'Public Cloud'],
    ['password', 'PUBLIC_NATS_PASSWORD', 'Public Cloud'],
  ])('throws when only %s is provided for %s', (_type, envName, cloud) => {
    process.env[envName] = 'test-value';

    expect(() => require('./config')).toThrow(`${cloud} NATS username and password must both be provided`);
  });
});
