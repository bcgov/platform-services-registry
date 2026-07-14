import { publicCloudEnvironmentKeys, PublicCloudEnvironmentKey } from '@/constants/public-cloud';

export interface AwsLzaAccount {
  environment: PublicCloudEnvironmentKey;
  name: string;
  accountId: string;
}

function isPublicCloudEnvironmentKey(environment: string): environment is PublicCloudEnvironmentKey {
  return publicCloudEnvironmentKeys.includes(environment as PublicCloudEnvironmentKey);
}

export function mergeAwsLzaAccounts(existingAccounts: unknown = [], resolvedAccounts: AwsLzaAccount[] = []) {
  const accountsByEnvironment = new Map<PublicCloudEnvironmentKey, AwsLzaAccount>();

  normalizeStoredAwsLzaAccounts(existingAccounts).forEach((account) => {
    if (!isPublicCloudEnvironmentKey(account.environment)) return;

    accountsByEnvironment.set(account.environment, {
      environment: account.environment,
      name: account.name,
      accountId: account.accountId,
    });
  });

  resolvedAccounts.forEach((account) => {
    accountsByEnvironment.set(account.environment, account);
  });

  return publicCloudEnvironmentKeys
    .map((environment) => accountsByEnvironment.get(environment))
    .filter((account): account is AwsLzaAccount => Boolean(account));
}

export function normalizeStoredAwsLzaAccounts(accounts: unknown): AwsLzaAccount[] {
  if (!Array.isArray(accounts)) return [];

  return accounts.filter((account): account is AwsLzaAccount => {
    if (!account || typeof account !== 'object' || Array.isArray(account)) return false;

    const candidate = account as Record<string, unknown>;
    return (
      typeof candidate.environment === 'string' &&
      isPublicCloudEnvironmentKey(candidate.environment) &&
      typeof candidate.name === 'string' &&
      candidate.name.length > 0 &&
      typeof candidate.accountId === 'string' &&
      candidate.accountId.length > 0
    );
  });
}
