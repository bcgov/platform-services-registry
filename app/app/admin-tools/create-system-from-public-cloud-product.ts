import { z } from 'zod';
import { logger } from '@/core/logging';
import { publicCloudProductDetailInclude } from '@/services/db/includes';
import { createSystemFromPublicCloudProduct, type BootstrapResult } from './bootstrap-system-from-product';
import prisma from './prisma';

const cliArgsSchema = z.object({
  licencePlate: z.string().min(1).optional(),
});

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];

    if (token === '--licence-plate' || token === '--license-plate') {
      const value = rawArgs[i + 1];
      if (value) {
        args.licencePlate = value;
        i += 1;
      }
    }
  }

  return cliArgsSchema.parse(args);
}

async function main() {
  const { licencePlate } = parseArgs(process.argv);

  const products = await prisma.publicCloudProduct.findMany({
    where: licencePlate ? { licencePlate } : undefined,
    include: publicCloudProductDetailInclude,
    orderBy: { name: 'asc' },
  });

  if (products.length === 0) {
    throw new Error(
      licencePlate
        ? `No public cloud product found for licence plate "${licencePlate}".`
        : 'No public cloud products found.',
    );
  }

  const results: BootstrapResult[] = [];

  for (const product of products) {
    const result = await createSystemFromPublicCloudProduct(product);
    results.push(result);
  }

  const summary = {
    ok: true,
    processed: results.length,
    created: results.filter((result) => result.ok && !result.alreadyExists).length,
    alreadyExists: results.filter((result) => result.ok && result.alreadyExists).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };

  logger.info('create-system-from-public-cloud-product completed', summary);
  console.log(
    `${summary.created} Systems created from ${summary.processed} Public Cloud Products. ${summary.alreadyExists} Systems already existed with links to products and were ignored. ${summary.failed} products failed.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('create-system-from-public-cloud-product failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
