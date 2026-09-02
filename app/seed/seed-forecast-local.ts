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
  isPastMonth,
  isRequiredForecastMonth,
  monthKey,
  type MonthlyValue,
} from '../components/public-cloud/forecast/forecast-grid-utils';
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import { createProductForecast, getProductForecast } from '../services/db/public-cloud-forecast';

const DEFAULT_PLATE = 'e71b0e';
const ADMIN_EMAIL = 'admin.system@gov.bc.ca';
const DEFAULT_MONTHLY_FORECAST_AZURE = 5000;
const DEFAULT_MONTHLY_FORECAST_AWS = 4000;

/** How a demo product’s forecast should be seeded for local testing. */
export type ForecastSeedProfile =
  | 'complete'
  | 'with-past'
  | 'from-may'
  | 'from-jun'
  | 'from-jul'
  | 'from-aug'
  | 'incomplete-required'
  | 'sparse-optional'
  | 'missing';

/**
 * Overrides only. Default is `with-past`: the product existed at FY start (April)
 * and already has Apr–(current-1) forecasted. A few plates onboard later so the
 * estate grows slowly toward the current month.
 */
export const FORECAST_SEED_PROFILES: Record<string, ForecastSeedProfile> = {
  // Onboarded after April (one Azure + one AWS each)
  aa0020: 'from-may',
  bb0020: 'from-may',
  aa0021: 'from-jun',
  bb0021: 'from-jun',
  aa0022: 'from-jul',
  bb0022: 'from-jul',
  aa0023: 'from-aug',
  bb0023: 'from-aug',
  aa0024: 'complete',
  bb0024: 'complete',
  // Filter-exercise plates (still existed in April)
  a1c2d3: 'incomplete-required',
  b4e5f6: 'incomplete-required',
  aa0005: 'incomplete-required',
  aa0010: 'incomplete-required',
  bb0005: 'incomplete-required',
  bb0010: 'incomplete-required',
  bb0053: 'sparse-optional',
  aa0053: 'sparse-optional',
  aa0002: 'missing',
  bb0002: 'missing',
};

const PROFILE_START_MONTH: Partial<Record<ForecastSeedProfile, number>> = {
  'with-past': 4,
  'incomplete-required': 4,
  'sparse-optional': 4,
  'from-may': 5,
  'from-jun': 6,
  'from-jul': 7,
  'from-aug': 8,
};

export function getForecastSeedProfile(licencePlate: string): ForecastSeedProfile {
  return FORECAST_SEED_PROFILES[licencePlate] ?? 'with-past';
}

/** First FY month this plate should have forecast / actuals. Current month for `complete`. */
export function getForecastStartMonth(licencePlate: string, now = new Date()): { year: number; month: number } {
  const profile = getForecastSeedProfile(licencePlate);
  if (profile === 'complete' || profile === 'missing') {
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }
  const month = PROFILE_START_MONTH[profile] ?? 4;
  const fyStartYear = now.getUTCMonth() + 1 >= 4 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return { year: month >= 4 ? fyStartYear : fyStartYear + 1, month };
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

function fiscalMonthOrder(month: number) {
  return month >= 4 ? month : month + 12;
}

/**
 * Fill past months from `fromMonth` (FY calendar month, default April) at the
 * required-horizon amount. Earlier FY months stay 0 (product not onboarded yet).
 */
export function applyPastFiscalMonths(values: MonthlyValue[], now = new Date(), fromMonth = 4): MonthlyValue[] {
  const sampleAmount =
    values.find((value) => isRequiredForecastMonth(value.year, value.month, now) && value.amount > 0)?.amount ?? 0;
  if (sampleAmount <= 0) return values;
  const startOrder = fiscalMonthOrder(fromMonth);

  return values.map((value) => {
    if (!isPastMonth(value.year, value.month, now)) return value;
    if (fiscalMonthOrder(value.month) < startOrder) return { ...value, amount: 0 };
    return { ...value, amount: sampleAmount };
  });
}

/** Like with-past, but leave April (FY start) at 0. */
export function applyPastFiscalMonthsFromMay(values: MonthlyValue[], now = new Date()): MonthlyValue[] {
  return applyPastFiscalMonths(values, now, 5);
}

/** Drop the last past forecast so live actuals land over forecast for that month. */
export function applyLastPastMonthLowForecast(values: MonthlyValue[], amount = 50, now = new Date()): MonthlyValue[] {
  const lastPast = [...values].reverse().find((value) => isPastMonth(value.year, value.month, now) && value.amount > 0);
  if (!lastPast) return values;
  return values.map((value) =>
    value.year === lastPast.year && value.month === lastPast.month ? { ...value, amount } : value,
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

function buildSeedMonthlyValues(product: { provider: Provider }) {
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

  let monthlyValues = buildSeedMonthlyValues(product);
  const startMonth = PROFILE_START_MONTH[profile];
  if (startMonth) {
    monthlyValues = applyPastFiscalMonths(monthlyValues, new Date(), startMonth);
  }
  if (profile === 'incomplete-required') {
    monthlyValues = applyIncompleteRequiredMonths(monthlyValues);
  } else if (profile === 'sparse-optional') {
    monthlyValues = applySparseOptionalMonth(monthlyValues);
  }

  const forecast = await createProductForecast(licencePlate, monthlyValues, FISCAL_FORECAST_HORIZON_MONTHS);
  const filledRequired = monthlyValues.filter(
    (value) => isRequiredForecastMonth(value.year, value.month) && value.amount > 0,
  ).length;
  const filledPast = monthlyValues.filter((value) => isPastMonth(value.year, value.month) && value.amount > 0).length;
  console.log(
    `  created forecast (${monthlyValues.length} months, profile "${profile}", ${filledRequired} required + ${filledPast} past months filled)`,
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
  options: {
    reset?: boolean;
    skipForecast?: boolean;
    showWalkthrough?: boolean;
    profile?: ForecastSeedProfile;
  } = {},
) {
  const { reset = false, skipForecast = false, showWalkthrough = false } = options;
  const profile = options.profile ?? getForecastSeedProfile(licencePlate);

  console.log(`Seeding forecast demo data for ${licencePlate} (profile: ${profile})...`);

  const product = await prisma.publicCloudProduct.findFirst({ where: { licencePlate } });
  if (!product) {
    throw new Error(
      `No product found for licence plate "${licencePlate}". Run pnpm run seed-all-local or pnpm run seed-forge-finance-local first.`,
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
