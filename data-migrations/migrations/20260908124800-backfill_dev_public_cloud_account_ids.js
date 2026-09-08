import { createHash, randomBytes, randomUUID } from 'node:crypto';

const AWS_ACCOUNT_ID = /^\d{12}$/;
const AZURE_SUBSCRIPTION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ENV_KEYS = ['production', 'development', 'test', 'tools'];
const ENV_SHORT = { production: 'prod', development: 'dev', test: 'test', tools: 'tools' };

function isDevOnly() {
  return process.env.APP_ENV === 'dev';
}

function enabledEnvironments(product) {
  const enabled = ENV_KEYS.filter((key) => product.environmentsEnabled?.[key] === true);
  return enabled.length > 0 ? enabled : ['production'];
}

function accountName(licencePlate, environment) {
  return `${licencePlate}-${ENV_SHORT[environment]}`;
}

function countIdentifiers(products) {
  const counts = new Map();
  const bump = (value) => {
    if (typeof value !== 'string' || value.length === 0) return;
    const key = value.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  for (const product of products) {
    for (const account of Array.isArray(product.awsAccounts) ? product.awsAccounts : []) {
      bump(account?.accountId);
    }
    for (const subscription of Array.isArray(product.azureSubscriptions) ? product.azureSubscriptions : []) {
      bump(subscription?.subscriptionId);
    }
    for (const link of Array.isArray(product.billingAccountLinks) ? product.billingAccountLinks : []) {
      bump(link?.accountIdentifier);
    }
  }

  return counts;
}

function needsReplacement(value, valid, counts) {
  if (typeof value !== 'string' || value.length === 0 || !valid(value)) return true;
  return (counts.get(value.trim().toLowerCase()) ?? 0) > 1;
}

function inventAwsAccountId(licencePlate, environment, used) {
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const hex = createHash('sha256').update(`dev-aws:${licencePlate}:${environment}:${attempt}`).digest('hex');
    const id = (BigInt(`0x${hex.slice(0, 16)}`) % 10n ** 12n).toString().padStart(12, '0');
    if (!used.has(id)) {
      used.add(id);
      return id;
    }
  }

  const fallback = String(randomBytes(6).readUIntBE(0, 6) % 10 ** 12).padStart(12, '0');
  used.add(fallback);
  return fallback;
}

function inventAzureSubscriptionId(licencePlate, environment, used) {
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const hex = createHash('sha256').update(`dev-azure:${licencePlate}:${environment}:${attempt}`).digest('hex');
    const id = [
      hex.slice(0, 8),
      hex.slice(8, 12),
      `4${hex.slice(13, 16)}`,
      `${((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
      hex.slice(20, 32),
    ].join('-');
    const key = id.toLowerCase();
    if (!used.has(key)) {
      used.add(key);
      return id;
    }
  }

  const fallback = randomUUID();
  used.add(fallback.toLowerCase());
  return fallback;
}

function existingByEnvironment(items, key) {
  return new Map(
    (Array.isArray(items) ? items : [])
      .filter((item) => item && ENV_KEYS.includes(item.environment))
      .map((item) => [item.environment, item]),
  );
}

function reserveKeptIds(products, counts, used) {
  for (const product of products) {
    if (product.provider === 'AWS_LZA') {
      const byEnv = existingByEnvironment(product.awsAccounts);
      for (const environment of enabledEnvironments(product)) {
        const existing = byEnv.get(environment);
        if (existing && !needsReplacement(existing.accountId, (value) => AWS_ACCOUNT_ID.test(value), counts)) {
          used.add(existing.accountId);
        }
      }
      continue;
    }

    const byEnv = existingByEnvironment(product.azureSubscriptions);
    for (const environment of enabledEnvironments(product)) {
      const existing = byEnv.get(environment);
      if (
        existing &&
        !needsReplacement(existing.subscriptionId, (value) => AZURE_SUBSCRIPTION_ID.test(value), counts)
      ) {
        used.add(existing.subscriptionId.toLowerCase());
      }
    }
  }
}

function buildAwsLzaAccounts(product, counts, used) {
  const byEnv = existingByEnvironment(product.awsAccounts);

  return enabledEnvironments(product).map((environment) => {
    const existing = byEnv.get(environment);
    const keep =
      existing && !needsReplacement(existing.accountId, (value) => AWS_ACCOUNT_ID.test(value), counts)
        ? existing.accountId
        : inventAwsAccountId(product.licencePlate, environment, used);
    return {
      environment,
      name: existing?.name || accountName(product.licencePlate, environment),
      accountId: keep,
    };
  });
}

function buildAzureSubscriptions(product, counts, used) {
  const byEnv = existingByEnvironment(product.azureSubscriptions);

  return enabledEnvironments(product).map((environment) => {
    const existing = byEnv.get(environment);
    const keep =
      existing && !needsReplacement(existing.subscriptionId, (value) => AZURE_SUBSCRIPTION_ID.test(value), counts)
        ? existing.subscriptionId
        : inventAzureSubscriptionId(product.licencePlate, environment, used);
    return {
      environment,
      name: existing?.name || accountName(product.licencePlate, environment),
      subscriptionId: keep,
    };
  });
}

export const up = async (db, client) => {
  if (!isDevOnly()) {
    console.log(`backfill_dev_public_cloud_account_ids: skip (APP_ENV=${process.env.APP_ENV || 'unset'})`);
    return;
  }

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const PublicCloudProduct = db.collection('PublicCloudProduct');
      const products = await PublicCloudProduct.find(
        { provider: { $in: ['AWS_LZA', 'AZURE'] } },
        {
          projection: {
            licencePlate: 1,
            provider: 1,
            environmentsEnabled: 1,
            awsAccounts: 1,
            azureSubscriptions: 1,
            billingAccountLinks: 1,
          },
          session,
        },
      ).toArray();

      const counts = countIdentifiers(products);
      const used = new Set();
      reserveKeptIds(products, counts, used);
      const writes = [];

      for (const product of products) {
        if (product.provider === 'AWS_LZA') {
          const awsAccounts = buildAwsLzaAccounts(product, counts, used);
          writes.push({
            updateOne: {
              filter: { _id: product._id },
              update: {
                $set: {
                  awsAccounts,
                  billingAccountLinks: awsAccounts.map((account) => ({
                    provider: 'AWS_LZA',
                    accountIdentifier: account.accountId,
                    environment: account.environment,
                  })),
                },
              },
            },
          });
          continue;
        }

        const azureSubscriptions = buildAzureSubscriptions(product, counts, used);
        writes.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                azureSubscriptions,
                billingAccountLinks: azureSubscriptions.map((subscription) => ({
                  provider: 'AZURE',
                  accountIdentifier: subscription.subscriptionId,
                  environment: subscription.environment,
                })),
              },
            },
          },
        });
      }

      if (writes.length === 0) {
        console.log('backfill_dev_public_cloud_account_ids: no AWS_LZA / AZURE products.');
        return;
      }

      const result = await PublicCloudProduct.bulkWrite(writes, { ordered: false, session });
      console.log(
        `backfill_dev_public_cloud_account_ids: updated ${result.modifiedCount} of ${writes.length} public-cloud products.`,
      );
    });
  } catch (error) {
    console.error('backfill_dev_public_cloud_account_ids failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const down = async () => {
  console.log('backfill_dev_public_cloud_account_ids: down is a no-op (generated IDs are not restored).');
};
