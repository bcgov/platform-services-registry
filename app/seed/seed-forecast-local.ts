/**
 * Seed approved forecasts + closed-month spend history for local forecast testing.
 * Run: pnpm run seed-forecast-local [licencePlate] [--reset] [--skip-forecast]
 *
 * Default licence plate: e71b0e (Cost Model Test 1)
 */
import {
  buildRollingFiscalForecastMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
} from '../components/public-cloud/forecast/forecast-grid-utils';
import prisma from '../core/prisma';
import { getUsdToCadRate } from '../helpers/usd-cad-fx';
import { Provider } from '../prisma/client';
import {
  createForecastDraft,
  getActiveApprovedForecast,
  seedForecastFromProductBudget,
  upsertConsumptionHistory,
} from '../services/db/public-cloud-forecast';

const DEFAULT_PLATE = 'e71b0e';
const ADMIN_EMAIL = 'admin.system@gov.bc.ca';
const DEFAULT_MONTHLY_FORECAST_AZURE = 5000;
const DEFAULT_MONTHLY_FORECAST_AWS = 4000;

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

function billingPeriodMonthsBack(count: number) {
  const now = new Date();
  const periods: { year: number; month: number }[] = [];
  for (let i = count; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return periods;
}

async function clearForecastData(licencePlate: string) {
  await prisma.cloudSpendHistory.deleteMany({ where: { licencePlate } });
  await prisma.cloudCostForecast.deleteMany({ where: { licencePlate } });
}

async function ensureApprovedForecast(
  licencePlate: string,
  userId: string,
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
) {
  const existing = await getActiveApprovedForecast(licencePlate);
  if (existing) {
    console.log(`  approved forecast v${existing.version} already exists — skipped`);
    return existing;
  }

  const monthlyValues =
    monthlyForecastTotal(product) > 0
      ? seedForecastFromProductBudget(product.provider, product.budget, product.environmentsEnabled)
      : buildMonthlyValues(product, resolveMonthlyForecastAmount(product));
  const forecast = await createForecastDraft(licencePlate, monthlyValues, FISCAL_FORECAST_HORIZON_MONTHS);
  console.log(`  created forecast v${forecast.version}`);
  return forecast;
}

function monthlyForecastTotal(product: {
  provider: Provider;
  budget: { dev: number; test: number; prod: number; tools: number };
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  };
}) {
  let total = 0;
  if (product.environmentsEnabled.development) total += product.budget.dev;
  if (product.environmentsEnabled.test) total += product.budget.test;
  if (product.environmentsEnabled.production) total += product.budget.prod;
  if (product.environmentsEnabled.tools) total += product.budget.tools;
  return total;
}

function resolveMonthlyForecastAmount(product: {
  provider: Provider;
  budget: { dev: number; test: number; prod: number; tools: number };
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  };
}) {
  const fromBudget = monthlyForecastTotal(product);
  if (fromBudget > 0) return fromBudget;
  return product.provider === Provider.AZURE ? DEFAULT_MONTHLY_FORECAST_AZURE : DEFAULT_MONTHLY_FORECAST_AWS;
}

function buildMonthlyValues(
  product: { provider: Provider },
  monthlyAmount: number,
  horizonMonths = FISCAL_FORECAST_HORIZON_MONTHS,
) {
  return buildRollingFiscalForecastMonths(monthlyAmount, 'CAD', new Date(), horizonMonths);
}

function printWalkthrough(licencePlate: string) {
  console.log('\n--- Forecast walkthrough checklist ---\n');
  console.log('Prerequisites: sandbox running, pnpm run dev, logged in as admin.system@gov.bc.ca\n');
  console.log('1. Product spend forecast');
  console.log(`   http://localhost:3000/public-cloud/products/${licencePlate}/edit`);
  console.log('   - Active approved forecast grid (read-only)');
  console.log('   - Create / edit / submit / approve forecast workflow\n');
  console.log('2. Admin platform forecast');
  console.log('   http://localhost:3000/public-cloud/forecast\n');
  console.log('Re-seed: pnpm run seed-forecast-local -- --reset');
  console.log('Forecast UI only (no auto-approve): pnpm run seed-forecast-local -- --skip-forecast --reset\n');
}

export async function seedForecastForProduct(
  licencePlate: string,
  options: { reset?: boolean; skipForecast?: boolean; showWalkthrough?: boolean } = {},
) {
  const { reset = false, skipForecast = false, showWalkthrough = false } = options;

  console.log(`Seeding forecast demo data for ${licencePlate}...`);

  const product = await prisma.publicCloudProduct.findFirst({ where: { licencePlate } });
  if (!product) {
    throw new Error(
      `No product found for licence plate "${licencePlate}". Run pnpm run seed-all-local or create a product first.`,
    );
  }

  const adminUser = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
  if (!adminUser) {
    throw new Error(`User ${ADMIN_EMAIL} not found. Run pnpm run seed-local first.`);
  }

  if (reset) {
    console.log('  clearing existing forecast data...');
    await clearForecastData(licencePlate);
  }

  const forecastAmount = resolveMonthlyForecastAmount(product);
  // Forecasts are always CAD. AWS CSP payloads stay in USD (invoice currency).
  const cspCurrency: 'USD' | 'CAD' = product.provider === Provider.AZURE ? 'CAD' : 'USD';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const usdCadRate = getUsdToCadRate(year, month).rate;
  const cspAmountScale = cspCurrency === 'USD' ? 1 / usdCadRate : 1;
  const cspForecastAmount = Math.round(forecastAmount * cspAmountScale);

  if (!skipForecast) {
    console.log('Forecast:');
    await ensureApprovedForecast(licencePlate, adminUser.id, product);
  } else {
    console.log('Forecast: skipped (--skip-forecast)');
  }

  console.log('CSP spend history (3 closed months):');
  const historyMonths = billingPeriodMonthsBack(3).map((period, index) => {
    const actual = Math.round(cspForecastAmount * (0.88 + index * 0.04));
    const variance = actual - cspForecastAmount;
    const variancePct = cspForecastAmount > 0 ? (variance / cspForecastAmount) * 100 : 0;
    return {
      billingPeriod: period,
      currency: cspCurrency,
      actualTotal: actual,
      forecastTotal: cspForecastAmount,
      varianceAmount: variance,
      variancePercent: variancePct,
    };
  });
  await upsertConsumptionHistory({
    licencePlate,
    provider: product.provider,
    months: historyMonths,
  });
  console.log(`  ${historyMonths.length} months (CSP ${cspCurrency}, forecast CAD ${forecastAmount})`);

  if (showWalkthrough) {
    printWalkthrough(licencePlate);
  }
}

// CLI entry (below export)
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
