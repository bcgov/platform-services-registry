import prisma from '@/core/prisma';
import { Provider, ProjectStatus } from '@/prisma/client';
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
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function amountFor(seed: string, base: number) {
  const h = hashString(seed);
  return Math.round((base + (h % 700)) * 100) / 100;
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
          status: ProjectStatus.ACTIVE,
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

      const lines: NormalizedBillingLine[] = [];
      const accountFilter = scope?.accountIdentifiers?.length ? new Set(scope.accountIdentifiers) : null;

      for (const product of products) {
        let links = normalizeBillingAccountLinks(product.billingAccountLinks);
        if (links.length === 0) {
          links = inventDemoBillingLinks(product.licencePlate, product.provider);
        }

        for (const link of links) {
          if (accountFilter && !accountFilter.has(link.accountIdentifier)) continue;

          const services = SERVICE_LINES_BY_PROVIDER[product.provider] ?? ['Other'];
          for (const [index, serviceLine] of services.entries()) {
            // One product intentionally missing July data for edge-case demos.
            if (product.licencePlate === 'aa0003' && period.month === 7) continue;

            let amount = amountFor(
              `${product.licencePlate}:${serviceLine}:${period.year}:${period.month}`,
              120 + index * 80,
            );

            // Large positive variance / MoM spike patterns for anomaly demos.
            if (product.licencePlate === 'e71b0e' && serviceLine.includes('Storage')) {
              amount *= period.month >= 6 ? 2.4 : 1;
            }
            if (product.licencePlate === 'f82c1a' && period.month === 7) {
              amount *= 1.8;
            }
            // Negative variance: low actuals vs higher forecast.
            if (product.licencePlate === 'a1c2d3') {
              amount *= 0.35;
            }
            // First-seen Copilot-like line only in recent months on Azure demo.
            if (serviceLine === 'GitHub Copilot' && product.licencePlate !== 'e71b0e') {
              if (period.month < 6) continue;
            }

            lines.push({
              provider: product.provider,
              accountIdentifier: link.accountIdentifier,
              serviceLine,
              year: period.year,
              month: period.month,
              amountCad: Math.round(amount * partialFactor * 100) / 100,
              sourceCurrency: 'CAD',
            });
          }
        }
      }

      // Unmatched pool: invented accounts with no product link.
      if (!scope?.licencePlates?.length && !scope?.accountIdentifiers?.length) {
        for (const provider of [Provider.AZURE, Provider.AWS_LZA] as const) {
          lines.push({
            provider,
            accountIdentifier: provider === Provider.AZURE ? 'unmatched-azure-sub-0001' : '999999999999',
            serviceLine: provider === Provider.AZURE ? 'GitHub Copilot' : 'Amazon Simple Storage Service',
            year: period.year,
            month: period.month,
            amountCad: 250.5,
            sourceCurrency: 'CAD',
          });
        }
      }

      return lines;
    },
  };
}
