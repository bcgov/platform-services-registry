/**
 * Seed product forecasts for local forecast testing.
 * Run: pnpm run seed-forecast-local [licencePlate] [--reset] [--skip-forecast]
 *
 * Default licence plate: e71b0e (Cost Model Test 1)
 */
import {
  buildRollingFiscalForecastMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  sumEnabledEnvironmentBudgets,
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
) {
  const existing = await getProductForecast(licencePlate);
  if (existing) {
    console.log(`  forecast already exists — skipped`);
    return existing;
  }

  const budgetTotal = sumEnabledEnvironmentBudgets(product.budget, product.environmentsEnabled);
  const monthlyValues =
    budgetTotal > 0
      ? seedForecastFromProductBudget(product.provider, product.budget, product.environmentsEnabled)
      : buildRollingFiscalForecastMonths(resolveDefaultMonthlyAmount(product.provider), 'CAD', new Date());

  const forecast = await createProductForecast(licencePlate, monthlyValues, FISCAL_FORECAST_HORIZON_MONTHS);
  console.log(
    `  created forecast (${monthlyValues.length} months @ CA$${
      budgetTotal || resolveDefaultMonthlyAmount(product.provider)
    }/mo)`,
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
  console.log('Re-seed: pnpm run seed-forecast-local -- --reset\n');
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
    await ensureForecast(licencePlate, product);
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
