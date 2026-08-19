import { publicCloudEnvironmentKeys, PublicCloudEnvironmentKey } from '@/constants/public-cloud';
import { Provider } from '@/prisma/client';
import { normalizeStoredAwsLzaAccounts } from '@/services/aws-lza/accounts';
import { normalizeStoredAzureSubscriptions } from '@/services/azure/subscriptions';

export type BillingAccountLink = {
  provider: Provider;
  accountIdentifier: string;
  environment?: PublicCloudEnvironmentKey;
};

function isProvider(value: unknown): value is Provider {
  return value === Provider.AWS || value === Provider.AWS_LZA || value === Provider.AZURE;
}

function isEnvironment(value: unknown): value is PublicCloudEnvironmentKey {
  return typeof value === 'string' && publicCloudEnvironmentKeys.includes(value as PublicCloudEnvironmentKey);
}

/** Normalize stored billingAccountLinks Json. */
export function normalizeBillingAccountLinks(links: unknown): BillingAccountLink[] {
  if (!Array.isArray(links)) return [];

  return links.filter((link): link is BillingAccountLink => {
    if (!link || typeof link !== 'object' || Array.isArray(link)) return false;
    const candidate = link as Record<string, unknown>;
    if (!isProvider(candidate.provider)) return false;
    if (typeof candidate.accountIdentifier !== 'string' || candidate.accountIdentifier.length === 0) return false;
    if (candidate.environment !== undefined && !isEnvironment(candidate.environment)) return false;
    return true;
  });
}

/**
 * Resolve account/subscription identifiers used for spend join.
 * Prefers billingAccountLinks; falls back to AWS_LZA awsAccounts or Azure azureSubscriptions.
 * Classic AWS has no native account field — links only.
 */
export function resolveBillingAccountIdentifiers(product: {
  provider: Provider;
  billingAccountLinks?: unknown;
  awsAccounts?: unknown;
  azureSubscriptions?: unknown;
}): BillingAccountLink[] {
  const fromLinks = normalizeBillingAccountLinks(product.billingAccountLinks);
  if (fromLinks.length > 0) return fromLinks;

  if (product.provider === Provider.AWS_LZA) {
    return normalizeStoredAwsLzaAccounts(product.awsAccounts).map((account) => ({
      provider: Provider.AWS_LZA,
      accountIdentifier: account.accountId,
      environment: account.environment,
    }));
  }

  if (product.provider === Provider.AZURE) {
    return normalizeStoredAzureSubscriptions(product.azureSubscriptions).map((subscription) => ({
      provider: Provider.AZURE,
      accountIdentifier: subscription.subscriptionId,
      environment: subscription.environment,
    }));
  }

  return [];
}

/** Build a lookup map: `${provider}:${accountIdentifier}` → licencePlate. */
export function buildAccountToLicencePlateMap(
  products: Array<{
    licencePlate: string;
    provider: Provider;
    billingAccountLinks?: unknown;
    awsAccounts?: unknown;
    azureSubscriptions?: unknown;
  }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const product of products) {
    for (const link of resolveBillingAccountIdentifiers(product)) {
      map.set(`${link.provider}:${link.accountIdentifier}`, product.licencePlate);
    }
  }
  return map;
}

/** Invented demo billing links for local/dev seed (never real account IDs). */
export function inventDemoBillingLinks(licencePlate: string, provider: Provider): BillingAccountLink[] {
  const plate = licencePlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (provider === Provider.AZURE) {
    return [
      {
        provider: Provider.AZURE,
        accountIdentifier: `00000000-demo-azure-${plate.padEnd(12, '0').slice(0, 12)}`,
        environment: 'production',
      },
    ];
  }

  if (provider === Provider.AWS || provider === Provider.AWS_LZA) {
    // Fake 12-digit AWS account id derived from plate (not a real account).
    const digits = Array.from(plate)
      .map((ch) => ((ch.codePointAt(0) ?? 0) % 10).toString())
      .join('')
      .padEnd(12, '0')
      .slice(0, 12);
    return [
      { provider, accountIdentifier: digits, environment: 'development' },
      {
        provider,
        accountIdentifier: digits.replace(/.$/, (d) => String((Number(d) + 1) % 10)),
        environment: 'production',
      },
    ];
  }

  return [];
}
