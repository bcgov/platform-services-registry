/**
 * Seed product forecasts for local forecast testing.
 * Run: pnpm run seed-forecast-local [licencePlate] [--reset] [--skip-forecast]
 *
 * Default licence plate: e71b0e (Cost Model Test 1)
 *
 * Some demo plates use non-complete profiles so the platform rollup can be
 * exercised (incomplete required months, sparse optional, missing forecast).
 */
import {
  buildRollingFiscalForecastMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  isBeyondRequiredHorizon,
  isRequiredForecastMonth,
  monthKey,
  sumEnabledEnvironmentBudgets,
  type MonthlyValue,
} from '../components/public-cloud/forecast/forecast-grid-utils';
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import {
  createProductForecast,
  getProductForecast,
  seedForecastFromProductBudget,
} from '../services/db/public-cloud-forecast';

const DEFAULT_PLATE = 'e71b0e';
const ADMIN_EMAIL = 'admin.system@gov.bc.ca';
const DEFAULT_MONTHLY_FORECAST_AZURE = 5000;
const DEFAULT_MONTHLY_FORECAST_AWS = 4000;

/** How a demo product’s forecast should be seeded for local testing. */
export type ForecastSeedProfile = 'complete' | 'incomplete-required' | 'sparse-optional' | 'missing';

/**
 * Explicit demo plates with non-complete forecasts.
 * Re-seed with --reset to apply after changing these.
 */
export const FORECAST_SEED_PROFILES: Record<string, ForecastSeedProfile> = {
  // Named demo products
  a1c2d3: 'incomplete-required', // Cost Model Test 3 (Azure)
  b4e5f6: 'incomplete-required', // Cost Model Test 4 (AWS LZA)
  // Scale tests — incomplete required horizon
  aa0005: 'incomplete-required',
  aa0010: 'incomplete-required',
  bb0005: 'incomplete-required',
  bb0010: 'incomplete-required',
  // Sparse optional month (e.g. Jul beyond the 24-month window)
  bb0053: 'sparse-optional',
  aa0053: 'sparse-optional',
  // No forecast at all
  aa0002: 'missing',
  bb0002: 'missing',
};

export function getForecastSeedProfile(licencePlate: string): ForecastSeedProfile {
  return FORECAST_SEED_PROFILES[licencePlate] ?? 'complete';
}

/** Zero the last few required-horizon months so the product shows as incomplete. */
export function applyIncompleteRequiredMonths(values: MonthlyValue[], now = new Date()): MonthlyValue[] {
  const requiredKeys = values
    .filter((value) => isRequiredForecastMonth(value.year, value.month, now))
    .slice(-3)
    .map((value) => monthKey(value.year, value.month));
  const toClear = new Set(requiredKeys);

  return values.map((value) => (toClear.has(monthKey(value.year, value.month)) ? { ...value, amount: 0 } : value));
}

/** Keep a full required horizon and set a small amount on the first optional month. */
export function applySparseOptionalMonth(values: MonthlyValue[], amount = 100, now = new Date()): MonthlyValue[] {
  const firstOptional = values.find((value) => isBeyondRequiredHorizon(value.year, value.month, now));
  if (!firstOptional) return values;

  return values.map((value) =>
    value.year === firstOptional.year && value.month === firstOptional.month ? { ...value, amount } : value,
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const licencePlate = args.find((a) => !a.startsWith('--')) ?? DEFAULT_PLATE;
  return {
    licencePlate,
    reset: flags.has('--reset'),
    skipForecast: flags.has('--skip-forecast'),
  };
}

async function clearForecastData(licencePlate: string) {
  await prisma.cloudCostForecast.deleteMany({ where: { licencePlate } });
}

async function buildSeedMonthlyValues(product: {
  provider: Provider;
  budget: { dev: number; test: number; prod: number; tools: number };
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  };
}) {
  const budgetTotal = sumEnabledEnvironmentBudgets(product.budget, product.environmentsEnabled);
  if (budgetTotal > 0) {
    return seedForecastFromProductBudget(product.provider, product.budget, product.environmentsEnabled);
  }
  return buildRollingFiscalForecastMonths(resolveDefaultMonthlyAmount(product.provider), 'CAD', new Date());
}

async function ensureForecast(
  licencePlate: string,
  product: {
    provider: Provider;
    budget: { dev: number; test: number; prod: number; tools: number };
    environmentsEnabled: {
      development: boolean;
      test: boolean;
      production: boolean;
      tools: boolean;
    };
  },
  profile: ForecastSeedProfile,
) {
  if (profile === 'missing') {
    console.log(`  forecast profile "missing" — no forecast created`);
    return null;
  }

  const existing = await getProductForecast(licencePlate);
  if (existing) {
    console.log(`  forecast already exists — skipped (use --reset to re-apply profile "${profile}")`);
    return existing;
  }

  let monthlyValues = await buildSeedMonthlyValues(product);
  if (profile === 'incomplete-required') {
    monthlyValues = applyIncompleteRequiredMonths(monthlyValues);
  } else if (profile === 'sparse-optional') {
    monthlyValues = applySparseOptionalMonth(monthlyValues);
  }

  const forecast = await createProductForecast(licencePlate, monthlyValues, FISCAL_FORECAST_HORIZON_MONTHS);
  const filledRequired = monthlyValues.filter(
    (value) => isRequiredForecastMonth(value.year, value.month) && value.amount > 0,
  ).length;
  console.log(
    `  created forecast (${monthlyValues.length} months, profile "${profile}", ${filledRequired} required months filled)`,
  );
  return forecast;
}

function resolveDefaultMonthlyAmount(provider: Provider) {
  return provider === Provider.AZURE ? DEFAULT_MONTHLY_FORECAST_AZURE : DEFAULT_MONTHLY_FORECAST_AWS;
}

function printWalkthrough(licencePlate: string) {
  console.log('\n--- Forecast walkthrough ---\n');
  console.log('Prerequisites: sandbox running, pnpm run / make dev, logged in as admin.system@gov.bc.ca\n');
  console.log('1. Product spend forecast');
  console.log(`   http://localhost:3000/public-cloud/products/${licencePlate}/edit`);
  console.log('2. Admin platform forecast');
  console.log('   http://localhost:3000/public-cloud/forecast\n');
  console.log('Incomplete / sparse / missing demo plates:');
  for (const [plate, profile] of Object.entries(FORECAST_SEED_PROFILES)) {
    console.log(`   ${plate} → ${profile}`);
  }
  console.log('\nRe-seed: pnpm run seed-forecast-local -- --reset');
  console.log('Full re-seed: pnpm run seed-all-local -- --reset\n');
}

export async function seedForecastForProduct(
  licencePlate: string,
  options: { reset?: boolean; skipForecast?: boolean; showWalkthrough?: boolean } = {},
) {
  const { reset = false, skipForecast = false, showWalkthrough = false } = options;
  const profile = getForecastSeedProfile(licencePlate);

  console.log(`Seeding forecast demo data for ${licencePlate} (profile: ${profile})...`);

  const product = await prisma.publicCloudProduct.findFirst({ where: { licencePlate } });
  if (!product) {
    throw new Error(
      `No product found for licence plate "${licencePlate}". Run pnpm run seed-all-local or create a product first.`,
    );
  }

  const adminExists = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true },
  });
  if (!adminExists) {
    throw new Error(`User ${ADMIN_EMAIL} not found. Run pnpm run seed-local first.`);
  }

  if (reset) {
    console.log('  clearing existing forecast data...');
    await clearForecastData(licencePlate);
  }

  if (!skipForecast) {
    console.log('Forecast:');
    await ensureForecast(licencePlate, product, profile);
  } else {
    console.log('Forecast: skipped (--skip-forecast)');
  }

  if (showWalkthrough) {
    printWalkthrough(licencePlate);
  }
}

async function runCli() {
  const { licencePlate, reset, skipForecast } = parseArgs();
  await seedForecastForProduct(licencePlate, { reset, skipForecast, showWalkthrough: true });
}

if (require.main === module) {
  runCli()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
