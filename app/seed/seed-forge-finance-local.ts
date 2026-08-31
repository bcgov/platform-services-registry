/**
 * Billing-test seed: ministries, users, and the known Forge AWS / Azure products.
 * Reads paired plates and account IDs from .env.local. Do not commit those IDs.
 *
 * Use this when you want live Cost Explorer / Cost Management lines to match
 * registry products. For invented demo volume, use `pnpm run seed-all-local`.
 *
 * Run: pnpm run seed-forge-finance-local [--reset]
 *   --reset also removes invented demo products so finance is Forge-only.
 */
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import { elapsedCompleteFyMonths } from '../services/public-cloud-finance/ingest/missing-periods';
import {
  countDemoPublicCloudProducts,
  removeDemoPublicCloudProducts,
  seedDemoPublicCloudProduct,
  type DemoProductConfig,
} from './seed-demo-products';
import { seedForecastForProduct } from './seed-forecast-local';
import { seedFoundation } from './seed-foundation';

/** Real Forge accounts predate local seed. createdAt=now hides FY actuals as out of scope. */
export const FORGE_BILLING_STARTED_AT = new Date(Date.UTC(2025, 3, 1));

const AWS_ACCOUNT_ID = /^\d{12}$/;
const AZURE_SUBSCRIPTION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ForgeFinanceTarget = {
  licencePlate: string;
  accountIdentifier: string;
  provider: typeof Provider.AZURE | typeof Provider.AWS_LZA;
};

function splitCsv(raw: string | undefined) {
  return (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function inferForgeProvider(accountIdentifier: string): ForgeFinanceTarget['provider'] {
  if (AWS_ACCOUNT_ID.test(accountIdentifier)) return Provider.AWS_LZA;
  if (AZURE_SUBSCRIPTION_ID.test(accountIdentifier)) return Provider.AZURE;
  throw new Error(`Cannot infer provider for account id ${accountIdentifier}`);
}

export function parseForgeFinanceTargets(platesRaw: string | undefined, accountsRaw: string | undefined) {
  const plates = splitCsv(platesRaw);
  const accounts = splitCsv(accountsRaw);
  if (plates.length === 0 && accounts.length === 0) return [];
  if (plates.length !== accounts.length) {
    throw new Error(
      `FINANCE_LIVE_TEST_LICENCE_PLATES (${plates.length}) and FINANCE_LIVE_TEST_ACCOUNT_IDS (${accounts.length}) must be the same length.`,
    );
  }
  return plates.map((licencePlate, index) => {
    const accountIdentifier = accounts[index];
    return {
      licencePlate,
      accountIdentifier,
      provider: inferForgeProvider(accountIdentifier),
    };
  });
}

function requireForgeFinanceTargets() {
  const targets = parseForgeFinanceTargets(
    process.env.FINANCE_LIVE_TEST_LICENCE_PLATES,
    process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS,
  );
  if (targets.length === 0) {
    throw new Error(
      'Set FINANCE_LIVE_TEST_LICENCE_PLATES and FINANCE_LIVE_TEST_ACCOUNT_IDS in .env.local (paired licence plates and account / subscription IDs).',
    );
  }
  return targets;
}

function forgeProductConfig(target: ForgeFinanceTarget): DemoProductConfig {
  const isAzure = target.provider === Provider.AZURE;
  return {
    licencePlate: target.licencePlate,
    name: isAzure ? 'Forge Azure test' : 'Forge AWS LZA test',
    provider: target.provider,
    description: `Forge ${isAzure ? 'Azure' : 'AWS LZA'} test project for live finance ingest.`,
    budget: { dev: 4000, test: 3000, prod: 8000, tools: 1000 },
    accountIdentifier: target.accountIdentifier,
    billingStartedAt: FORGE_BILLING_STARTED_AT,
  };
}

async function ensureForgeRollupPlaceholders(licencePlate: string, provider: ForgeFinanceTarget['provider']) {
  for (const period of elapsedCompleteFyMonths()) {
    await prisma.monthlyProductSpendRollup.upsert({
      where: {
        licencePlate_provider_year_month: {
          licencePlate,
          provider,
          year: period.year,
          month: period.month,
        },
      },
      create: {
        licencePlate,
        provider,
        year: period.year,
        month: period.month,
        amountCad: 0,
      },
      update: {},
    });
  }
}

export async function seedForgeFinanceProducts() {
  const targets = requireForgeFinanceTargets();
  const products: Awaited<ReturnType<typeof seedDemoPublicCloudProduct>>[] = [];
  for (const target of targets) {
    const product = await seedDemoPublicCloudProduct(forgeProductConfig(target));
    await ensureForgeRollupPlaceholders(product.licencePlate, target.provider);
    products.push(product);
  }
  return products;
}

async function main() {
  const reset = process.argv.includes('--reset');
  console.log('=== Forge billing seed ===\n');

  console.log('1. Foundation (organizations, users)...');
  await seedFoundation();

  if (reset) {
    console.log('\n2. Removing invented demo products...');
    await removeDemoPublicCloudProducts();
  } else {
    const demoCount = await countDemoPublicCloudProducts();
    if (demoCount > 0) {
      console.log(
        `\n2. ${demoCount} invented demo products are still in the DB. Re-run with --reset for a Forge-only finance sandbox.`,
      );
    } else {
      console.log('\n2. No invented demo products present.');
    }
  }

  console.log('\n3. Forge products (real account / subscription IDs from .env.local)...');
  const products = await seedForgeFinanceProducts();

  console.log('\n4. Forecasts...');
  for (const product of products) {
    await seedForecastForProduct(product.licencePlate, { reset, profile: 'from-may' });
  }

  console.log('\n=== Forge billing seed complete ===');
  console.log('Actuals still come from the Airflow ingest DAG.');
  console.log('Login: admin.system@gov.bc.ca');
  for (const product of products) {
    console.log(`  http://localhost:3000/public-cloud/products/${product.licencePlate}/edit`);
  }
  console.log('  http://localhost:3000/public-cloud/finance');
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
