import prisma from '@/core/prisma';
import { Provider } from '@/prisma/client';
import { inventDemoBillingLinks, normalizeBillingAccountLinks } from '../billing-account-links';
import type { BillingFetchScope, BillingPeriod, BillingSource, NormalizedBillingLine } from './types';

const SERVICE_LINES_BY_PROVIDER: Record<Provider, string[]> = {
  [Provider.AWS]: [
    'Amazon Elastic Compute Cloud',
    'Amazon Simple Storage Service',
    'Amazon Relational Database Service',
    'AWS Lambda',
    'Amazon CloudWatch',
  ],
  [Provider.AWS_LZA]: [
    'Amazon Elastic Compute Cloud',
    'Amazon Simple Storage Service',
    'Amazon Virtual Private Cloud',
    'AWS Key Management Service',
    'Amazon GuardDuty',
  ],
  [Provider.AZURE]: [
    'Azure Kubernetes Service',
    'Azure Blob Storage',
    'Azure Database for PostgreSQL',
    'GitHub Copilot',
    'Azure Monitor',
    'Virtual Machines',
  ],
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + (input.codePointAt(i) ?? 0)) >>> 0;
  }
  return hash;
}

function amountFor(seed: string, base: number) {
  const h = hashString(seed);
  return Math.round((base + (h % 700)) * 100) / 100;
}

/** Plate-specific multipliers and Copilot skip. Returns null to skip the line. */
function adjustSimulatedAmount(
  licencePlate: string,
  serviceLine: string,
  period: BillingPeriod,
  amount: number,
): number | null {
  let adjusted = amount;

  // Large positive variance / MoM spike patterns for anomaly demos.
  if (licencePlate === 'e71b0e' && serviceLine.includes('Storage')) {
    adjusted *= period.month >= 6 ? 2.4 : 1;
  }
  if (licencePlate === 'f82c1a' && period.month === 7) {
    adjusted *= 1.8;
  }
  // Negative variance: low actuals vs higher forecast.
  if (licencePlate === 'a1c2d3') {
    adjusted *= 0.35;
  }
  // First-seen Copilot-like line only in recent months on Azure demo.
  if (serviceLine === 'GitHub Copilot' && licencePlate !== 'e71b0e' && period.month < 6) {
    return null;
  }

  return adjusted;
}

type ProductForSim = {
  licencePlate: string;
  provider: Provider;
  billingAccountLinks: unknown;
  name: string;
};

function resolveProductLinks(product: ProductForSim) {
  const links = normalizeBillingAccountLinks(product.billingAccountLinks);
  if (links.length > 0) return links;
  return inventDemoBillingLinks(product.licencePlate, product.provider);
}

function shouldSkipMissingJulyDemo(licencePlate: string, period: BillingPeriod) {
  return licencePlate === 'aa0003' && period.month === 7;
}

function buildServiceLinesForLink(
  product: ProductForSim,
  accountIdentifier: string,
  period: BillingPeriod,
  partialFactor: number,
): NormalizedBillingLine[] {
  if (shouldSkipMissingJulyDemo(product.licencePlate, period)) return [];

  const services = SERVICE_LINES_BY_PROVIDER[product.provider] ?? ['Other'];
  const lines: NormalizedBillingLine[] = [];

  for (const [index, serviceLine] of services.entries()) {
    const baseAmount = amountFor(
      `${product.licencePlate}:${serviceLine}:${period.year}:${period.month}`,
      120 + index * 80,
    );
    const amount = adjustSimulatedAmount(product.licencePlate, serviceLine, period, baseAmount);
    if (amount == null) continue;

    lines.push({
      provider: product.provider,
      accountIdentifier,
      serviceLine,
      year: period.year,
      month: period.month,
      amountCad: Math.round(amount * partialFactor * 100) / 100,
      sourceCurrency: 'CAD',
    });
  }

  return lines;
}

function buildLinesForProduct(
  product: ProductForSim,
  period: BillingPeriod,
  partialFactor: number,
  accountFilter: Set<string> | null,
): NormalizedBillingLine[] {
  const lines: NormalizedBillingLine[] = [];

  for (const link of resolveProductLinks(product)) {
    if (accountFilter && !accountFilter.has(link.accountIdentifier)) continue;
    lines.push(...buildServiceLinesForLink(product, link.accountIdentifier, period, partialFactor));
  }

  return lines;
}

function buildProductLines(
  products: ProductForSim[],
  period: BillingPeriod,
  partialFactor: number,
  accountFilter: Set<string> | null,
): NormalizedBillingLine[] {
  return products.flatMap((product) => buildLinesForProduct(product, period, partialFactor, accountFilter));
}

function buildUnmatchedLines(period: BillingPeriod): NormalizedBillingLine[] {
  return ([Provider.AZURE, Provider.AWS_LZA] as const).map((provider) => ({
    provider,
    accountIdentifier: provider === Provider.AZURE ? 'unmatched-azure-sub-0001' : '999999999999',
    serviceLine: provider === Provider.AZURE ? 'GitHub Copilot' : 'Amazon Simple Storage Service',
    year: period.year,
    month: period.month,
    amountCad: 250.5,
    sourceCurrency: 'CAD',
  }));
}

/**
 * Simulated billing source for local and Dev.
 * Emits matched lines, unmatched lines, partial current-month rows, and anomaly patterns.
 */
export function createSimulatedBillingSource(): BillingSource {
  return {
    name: 'simulated',
    async fetchBillingLines(period: BillingPeriod, scope?: BillingFetchScope): Promise<NormalizedBillingLine[]> {
      const products = await prisma.publicCloudProduct.findMany({
        where: {
          ...(scope?.licencePlates?.length ? { licencePlate: { in: scope.licencePlates } } : {}),
        },
        select: {
          licencePlate: true,
          provider: true,
          billingAccountLinks: true,
          name: true,
        },
      });

      const now = new Date();
      const isCurrentMonth = period.year === now.getFullYear() && period.month === now.getMonth() + 1;
      const partialFactor = isCurrentMonth ? Math.max(0.15, now.getDate() / 28) : 1;
      const accountFilter = scope?.accountIdentifiers?.length ? new Set(scope.accountIdentifiers) : null;

      const lines = buildProductLines(products, period, partialFactor, accountFilter);

      // Unmatched pool: invented accounts with no product link.
      if (!scope?.licencePlates?.length && !scope?.accountIdentifiers?.length) {
        lines.push(...buildUnmatchedLines(period));
      }

      return lines;
    },
  };
}
