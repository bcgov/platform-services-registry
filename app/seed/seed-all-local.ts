/**
 * Full local dev seed: ministries, users, demo products, forecast demo data.
 * Run: pnpm run seed-all-local [--reset]
 */
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import {
  AWS_DEMO_PLATES,
  AZURE_DEMO_PLATES,
  expectedMonthlyForecastRollup,
  seedDemoPublicCloudProducts,
} from './seed-demo-products';
import { seedForecastForProduct } from './seed-forecast-local';
import { seedFoundation } from './seed-foundation';

async function main() {
  const reset = process.argv.includes('--reset');

  console.log('=== Local full seed ===\n');

  console.log('1. Foundation (organizations, users)...');
  await seedFoundation();

  console.log(
    `\n2. Demo public cloud products (${AZURE_DEMO_PLATES.length} Azure + ${AWS_DEMO_PLATES.length} AWS LZA)...`,
  );
  await seedDemoPublicCloudProducts();

  console.log('\n3. Forecast demo data (forecasts + spend history)...');
  for (const licencePlate of AZURE_DEMO_PLATES) {
    await seedForecastForProduct(licencePlate, {
      reset,
      showWalkthrough: licencePlate === AZURE_DEMO_PLATES[0],
    });
  }

  for (const licencePlate of AWS_DEMO_PLATES) {
    await seedForecastForProduct(licencePlate, { reset });
  }

  console.log('\n=== Seed complete ===');
  console.log(`Login: admin.system@gov.bc.ca`);
  console.log('Azure products:');
  for (const plate of AZURE_DEMO_PLATES) {
    console.log(`  http://localhost:3000/public-cloud/products/${plate}/edit`);
  }
  console.log('AWS LZA products:');
  for (const plate of AWS_DEMO_PLATES) {
    console.log(`  http://localhost:3000/public-cloud/products/${plate}/edit`);
  }
  console.log(`Public Cloud Forecast: http://localhost:3000/public-cloud/forecast`);
  console.log(
    `Expected rollups: Azure CA$${expectedMonthlyForecastRollup(
      Provider.AZURE,
    ).toLocaleString()}/mo, AWS LZA $${expectedMonthlyForecastRollup(Provider.AWS_LZA).toLocaleString()}/mo`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
