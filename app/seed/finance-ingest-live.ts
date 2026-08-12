/**
 * Opt-in local live ingest for allowlisted licence plates.
 * Run: pnpm run finance-ingest-live
 *
 * Requires gitignored .env.local:
 *   FINANCE_LIVE_TEST_LICENCE_PLATES=plate1,plate2
 *   FINANCE_AWS_COST_EXPORT_PATH=... and/or FINANCE_AZURE_COST_EXPORT_PATH=...
 *
 * Does not invent real spend into the repo. Skips cleanly when allowlist/credentials missing.
 */
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import { resolveBillingAccountIdentifiers } from '../services/public-cloud-finance/billing-account-links';
import { createAwsBillingSource, createAzureBillingSource } from '../services/public-cloud-finance/ingest/real-sources';
import { ingestBillingPeriod } from '../services/public-cloud-finance/ingest/run-ingest';

function parsePlates() {
  const fromArg = process.argv.find((arg) => arg.startsWith('--plates='));
  const raw = fromArg?.slice('--plates='.length) || process.env.FINANCE_LIVE_TEST_LICENCE_PLATES || '';
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function main() {
  const plates = parsePlates();
  if (plates.length === 0) {
    console.log('No FINANCE_LIVE_TEST_LICENCE_PLATES (or --plates=) configured — skipping live ingest.');
    return;
  }

  const now = new Date();
  const period = { year: now.getFullYear(), month: now.getMonth() + 1 };

  const products = await prisma.publicCloudProduct.findMany({
    where: { licencePlate: { in: plates } },
    select: {
      licencePlate: true,
      provider: true,
      billingAccountLinks: true,
      awsAccounts: true,
      azureSubscriptions: true,
    },
  });

  if (products.length === 0) {
    throw new Error(`No products found for plates: ${plates.join(', ')}`);
  }

  for (const product of products) {
    const links = resolveBillingAccountIdentifiers(product);
    const accountIdentifiers = links.map((l) => l.accountIdentifier);
    if (accountIdentifiers.length === 0) {
      console.warn(`  ${product.licencePlate}: no billing account links — skip`);
      continue;
    }

    let source;
    try {
      if (product.provider === Provider.AZURE) source = createAzureBillingSource();
      else if (product.provider === Provider.AWS_LZA) source = createAwsBillingSource(Provider.AWS_LZA);
      else source = createAwsBillingSource(Provider.AWS);
    } catch (error) {
      console.warn(`  ${product.licencePlate}: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    try {
      const result = await ingestBillingPeriod({
        provider: product.provider,
        period,
        triggeredBy: 'finance-ingest-live',
        source,
        scope: { licencePlates: [product.licencePlate], accountIdentifiers },
      });
      console.log(
        `  ${product.licencePlate} ${product.provider}: loaded=${result.rowsLoaded} unmatched=${result.rowsUnmatched}`,
      );
    } catch (error) {
      console.warn(`  ${product.licencePlate}: ingest failed — ${error instanceof Error ? error.message : error}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
