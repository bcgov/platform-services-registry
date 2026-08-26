import type { CostExplorerClient, GetCostAndUsageCommandOutput } from '@aws-sdk/client-cost-explorer';
import { periodBounds, type BillingPeriod } from './types';

/** Cost Explorer LINKED_ACCOUNT filter is safest in modest chunks. */
export const AWS_LINKED_ACCOUNT_CHUNK = 100;

export type AwsExportRow = {
  accountIdentifier: string;
  serviceLine: string;
  amount: number;
  currency?: string;
  year?: number;
  month?: number;
};

export async function createAwsCostExplorerClient(options: {
  region: string;
  profile?: string;
}): Promise<CostExplorerClient> {
  const { CostExplorerClient } = await import('@aws-sdk/client-cost-explorer');
  const { region, profile } = options;

  if (profile) {
    const { fromIni } = await import('@aws-sdk/credential-providers');
    return new CostExplorerClient({
      region,
      credentials: fromIni({ profile }),
      maxAttempts: 8,
      retryMode: 'adaptive',
    });
  }

  return new CostExplorerClient({
    region,
    maxAttempts: 8,
    retryMode: 'adaptive',
  });
}

export function chunkLinkedAccountIds(accountIds?: string[]) {
  if (!accountIds?.length) return [undefined];
  const chunks: Array<string[] | undefined> = [];
  for (let i = 0; i < accountIds.length; i += AWS_LINKED_ACCOUNT_CHUNK) {
    chunks.push(accountIds.slice(i, i + AWS_LINKED_ACCOUNT_CHUNK));
  }
  return chunks;
}

export function collectAwsCostExplorerRows(
  response: Pick<GetCostAndUsageCommandOutput, 'ResultsByTime'>,
  period: BillingPeriod,
): AwsExportRow[] {
  const rows: AwsExportRow[] = [];
  for (const result of response.ResultsByTime ?? []) {
    for (const group of result.Groups ?? []) {
      const [accountIdentifier, serviceLine] = group.Keys ?? [];
      if (!accountIdentifier || !serviceLine) continue;
      const amount = Number(group.Metrics?.UnblendedCost?.Amount ?? 0);
      if (!Number.isFinite(amount) || amount === 0) continue;
      rows.push({
        accountIdentifier,
        serviceLine,
        amount,
        currency: group.Metrics?.UnblendedCost?.Unit ?? 'USD',
        year: period.year,
        month: period.month,
      });
    }
  }
  return rows;
}

export async function fetchAwsCostExplorerPages(
  client: CostExplorerClient,
  period: BillingPeriod,
  linkedAccountIds?: string[],
): Promise<AwsExportRow[]> {
  const { GetCostAndUsageCommand } = await import('@aws-sdk/client-cost-explorer');
  const { start, end } = periodBounds(period);
  const rows: AwsExportRow[] = [];

  for (const accountChunk of chunkLinkedAccountIds(linkedAccountIds)) {
    let nextPageToken: string | undefined;
    do {
      const response = await client.send(
        new GetCostAndUsageCommand({
          TimePeriod: { Start: start, End: end },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
          GroupBy: [
            { Type: 'DIMENSION', Key: 'LINKED_ACCOUNT' },
            { Type: 'DIMENSION', Key: 'SERVICE' },
          ],
          Filter: accountChunk?.length
            ? {
                Dimensions: {
                  Key: 'LINKED_ACCOUNT',
                  Values: accountChunk,
                },
              }
            : undefined,
          NextPageToken: nextPageToken,
        }),
      );
      rows.push(...collectAwsCostExplorerRows(response, period));
      nextPageToken = response.NextPageToken;
    } while (nextPageToken);
  }

  return rows;
}
