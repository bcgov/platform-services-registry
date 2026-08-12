import { publicCloudEnvironmentKeys, PublicCloudEnvironmentKey } from '@/constants/public-cloud';

export interface AzureSubscription {
  environment: PublicCloudEnvironmentKey;
  name: string;
  subscriptionId: string;
}

function isPublicCloudEnvironmentKey(environment: string): environment is PublicCloudEnvironmentKey {
  return publicCloudEnvironmentKeys.includes(environment as PublicCloudEnvironmentKey);
}

export function mergeAzureSubscriptions(
  existingSubscriptions: unknown = [],
  resolvedSubscriptions: AzureSubscription[] = [],
) {
  const byEnvironment = new Map<PublicCloudEnvironmentKey, AzureSubscription>();

  normalizeStoredAzureSubscriptions(existingSubscriptions).forEach((subscription) => {
    if (!isPublicCloudEnvironmentKey(subscription.environment)) return;

    byEnvironment.set(subscription.environment, {
      environment: subscription.environment,
      name: subscription.name,
      subscriptionId: subscription.subscriptionId,
    });
  });

  resolvedSubscriptions.forEach((subscription) => {
    byEnvironment.set(subscription.environment, subscription);
  });

  return publicCloudEnvironmentKeys
    .map((environment) => byEnvironment.get(environment))
    .filter((subscription): subscription is AzureSubscription => Boolean(subscription));
}

export function normalizeStoredAzureSubscriptions(subscriptions: unknown): AzureSubscription[] {
  if (!Array.isArray(subscriptions)) return [];

  return subscriptions.filter((subscription): subscription is AzureSubscription => {
    if (!subscription || typeof subscription !== 'object' || Array.isArray(subscription)) return false;

    const candidate = subscription as Record<string, unknown>;
    return (
      typeof candidate.environment === 'string' &&
      isPublicCloudEnvironmentKey(candidate.environment) &&
      typeof candidate.name === 'string' &&
      candidate.name.length > 0 &&
      typeof candidate.subscriptionId === 'string' &&
      candidate.subscriptionId.length > 0
    );
  });
}

/** Invented demo Azure subscriptions for local/dev seed (never real subscription IDs). */
export function inventDemoAzureSubscriptions(licencePlate: string): AzureSubscription[] {
  const plate = licencePlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const pad = plate.padEnd(12, '0').slice(0, 12);

  return [
    {
      environment: 'development',
      name: `${licencePlate}-dev`,
      subscriptionId: `00000000-demo-adev-${pad}`,
    },
    {
      environment: 'production',
      name: `${licencePlate}-prod`,
      subscriptionId: `00000000-demo-aprd-${pad}`,
    },
  ];
}
