import { spawn } from 'node:child_process';
import { Provider } from '@/prisma/client';
import { ensureMonthlyUsdCadRate } from '@/services/public-cloud-finance/monthly-fx-rate';
import type { BillingFetchScope, BillingPeriod, BillingSource, NormalizedBillingLine } from './types';

type ExportRow = {
  accountIdentifier: string;
  serviceLine: string;
  amount: number;
  currency?: string;
  year?: number;
  month?: number;
};

type FxContext = { rate: number; rateDate: Date };

function periodBounds(period: BillingPeriod) {
  const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`;
  const endMonth = period.month === 12 ? 1 : period.month + 1;
  const endYear = period.month === 12 ? period.year + 1 : period.year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  const endInclusive = new Date(Date.UTC(endYear, endMonth - 1, 0));
  const endDay = `${period.year}-${String(period.month).padStart(2, '0')}-${String(endInclusive.getUTCDate()).padStart(
    2,
    '0',
  )}`;
  return { start, end, endDay };
}

function toCad(
  amount: number,
  currency: string | undefined,
  fx: FxContext | null,
): { amountCad: number; fxRate?: number; fxRateDate?: Date } {
  const sourceCurrency = (currency ?? 'CAD').toUpperCase();
  if (sourceCurrency === 'CAD') {
    return { amountCad: amount, fxRate: 1, fxRateDate: fx?.rateDate ?? new Date() };
  }
  if (!fx) {
    throw new Error('USD→CAD conversion requires a month-end FX rate from Bank of Canada');
  }
  return { amountCad: amount * fx.rate, fxRate: fx.rate, fxRateDate: fx.rateDate };
}

async function resolvePeriodFx(period: BillingPeriod, rows: ExportRow[]): Promise<FxContext | null> {
  const needsUsd = rows.some((row) => (row.currency ?? 'CAD').toUpperCase() !== 'CAD');
  if (!needsUsd) return null;
  const stored = await ensureMonthlyUsdCadRate(period.year, period.month);
  return { rate: stored.rate, rateDate: stored.rateDate };
}

async function filterRows(
  rows: ExportRow[],
  provider: Provider,
  period: BillingPeriod,
  scope?: BillingFetchScope,
): Promise<NormalizedBillingLine[]> {
  const accountFilter = scope?.accountIdentifiers?.length ? new Set(scope.accountIdentifiers) : null;
  const filtered = rows
    .filter((row) => (!row.year || row.year === period.year) && (!row.month || row.month === period.month))
    .filter((row) => !accountFilter || accountFilter.has(row.accountIdentifier));
  const fx = await resolvePeriodFx(period, filtered);

  return filtered.map((row) => {
    const cad = toCad(row.amount, row.currency, fx);
    return {
      provider,
      accountIdentifier: row.accountIdentifier,
      serviceLine: row.serviceLine,
      year: period.year,
      month: period.month,
      amountCad: cad.amountCad,
      sourceCurrency: row.currency ?? 'CAD',
      fxRate: cad.fxRate,
      fxRateDate: cad.fxRateDate,
    };
  });
}

async function readExportFile(path: string): Promise<ExportRow[]> {
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Billing export at ${path} must be a JSON array`);
  }
  return parsed as ExportRow[];
}

function preferLiveApi() {
  const mode = (process.env.FINANCE_LIVE_BILLING || '').toLowerCase();
  return mode === 'api' || mode === 'live' || mode === '1' || mode === 'true';
}

function runCommand(command: string, args: string[], env?: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${args.join(' ')} failed (${code}): ${stderr || stdout}`));
    });
  });
}

async function fetchAwsCostExplorerRows(
  provider: Provider,
  period: BillingPeriod,
  scope?: BillingFetchScope,
): Promise<ExportRow[]> {
  const { CostExplorerClient, GetCostAndUsageCommand } = await import('@aws-sdk/client-cost-explorer');
  const { fromIni } = await import('@aws-sdk/credential-providers');

  const profile = process.env.FINANCE_AWS_PROFILE || process.env.AWS_PROFILE;
  const region = process.env.FINANCE_AWS_REGION || process.env.AWS_REGION || 'ca-central-1';
  const client = new CostExplorerClient({
    region,
    ...(profile ? { credentials: fromIni({ profile }) } : {}),
  });

  const { start, end } = periodBounds(period);
  const filter =
    scope?.accountIdentifiers?.length && scope.accountIdentifiers.length > 0
      ? {
          Dimensions: {
            Key: 'LINKED_ACCOUNT' as const,
            Values: scope.accountIdentifiers,
          },
        }
      : undefined;

  const response = await client.send(
    new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'LINKED_ACCOUNT' },
        { Type: 'DIMENSION', Key: 'SERVICE' },
      ],
      Filter: filter,
    }),
  );

  const rows: ExportRow[] = [];
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

  if (rows.length === 0) {
    throw new Error(
      `${provider} Cost Explorer returned no non-zero rows for ${period.year}-${period.month}. Check FINANCE_AWS_PROFILE / permissions.`,
    );
  }
  return rows;
}

async function fetchAzureCostManagementRows(period: BillingPeriod, scope?: BillingFetchScope): Promise<ExportRow[]> {
  const subscriptionIds =
    scope?.accountIdentifiers?.length && scope.accountIdentifiers.length > 0
      ? scope.accountIdentifiers
      : (process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS || '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);

  if (subscriptionIds.length === 0) {
    throw new Error(
      'Azure live billing requires FINANCE_LIVE_TEST_ACCOUNT_IDS (subscription IDs) or scope.accountIdentifiers.',
    );
  }

  const { start, endDay } = periodBounds(period);
  const rows: ExportRow[] = [];

  for (const subscriptionId of subscriptionIds) {
    const body = {
      type: 'ActualCost',
      timeframe: 'Custom',
      timePeriod: {
        from: `${start}T00:00:00Z`,
        to: `${endDay}T23:59:59Z`,
      },
      dataset: {
        granularity: 'None',
        aggregation: { totalCost: { name: 'Cost', function: 'Sum' } },
        grouping: [{ type: 'Dimension', name: 'ServiceName' }],
      },
    };

    const stdout = await runCommand('az', [
      'rest',
      '--method',
      'post',
      '--url',
      `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`,
      '--body',
      JSON.stringify(body),
    ]);

    const parsed = JSON.parse(stdout) as {
      properties?: { columns?: Array<{ name: string }>; rows?: Array<Array<string | number>> };
    };
    const columns = parsed.properties?.columns?.map((c) => c.name) ?? [];
    const costIdx = columns.indexOf('Cost');
    const serviceIdx = columns.indexOf('ServiceName');
    const currencyIdx = columns.indexOf('Currency');

    for (const row of parsed.properties?.rows ?? []) {
      const amount = Number(row[costIdx] ?? 0);
      const serviceLine = String(row[serviceIdx] ?? '');
      if (!serviceLine || !Number.isFinite(amount) || amount === 0) continue;
      rows.push({
        accountIdentifier: subscriptionId,
        serviceLine,
        amount,
        currency: currencyIdx >= 0 ? String(row[currencyIdx] ?? 'CAD') : 'CAD',
        year: period.year,
        month: period.month,
      });
    }
  }

  if (rows.length === 0) {
    throw new Error(`Azure Cost Management returned no non-zero rows for ${period.year}-${period.month}.`);
  }
  return rows;
}

/**
 * Real AWS / AWS_LZA billing adapter.
 * Prefers live Cost Explorer when FINANCE_LIVE_BILLING=api (uses AWS_PROFILE / FINANCE_AWS_PROFILE SSO).
 * Falls back to JSON export path FINANCE_AWS_COST_EXPORT_PATH / FINANCE_AWS_LZA_COST_EXPORT_PATH.
 */
export function createAwsBillingSource(provider: Provider = Provider.AWS): BillingSource {
  const envKey = provider === Provider.AWS_LZA ? 'FINANCE_AWS_LZA_COST_EXPORT_PATH' : 'FINANCE_AWS_COST_EXPORT_PATH';
  return {
    name: provider === Provider.AWS_LZA ? 'aws-lza' : 'aws',
    async fetchBillingLines(period, scope) {
      const path = process.env[envKey] || process.env.FINANCE_AWS_COST_EXPORT_PATH;
      if (preferLiveApi() || !path) {
        if (preferLiveApi() || process.env.FINANCE_AWS_PROFILE || process.env.AWS_PROFILE) {
          const rows = await fetchAwsCostExplorerRows(provider, period, scope);
          return filterRows(rows, provider, period, scope);
        }
      }
      if (!path) {
        throw new Error(
          `${provider} billing source is not configured. Set FINANCE_LIVE_BILLING=api with FINANCE_AWS_PROFILE, or ${envKey}.`,
        );
      }
      const rows = await readExportFile(path);
      return filterRows(rows, provider, period, scope);
    },
  };
}

/**
 * Real Azure Cost Management adapter.
 * Prefers live Cost Management query via `az login` when FINANCE_LIVE_BILLING=api.
 * Falls back to FINANCE_AZURE_COST_EXPORT_PATH JSON.
 */
export function createAzureBillingSource(): BillingSource {
  return {
    name: 'azure',
    async fetchBillingLines(period, scope) {
      const path = process.env.FINANCE_AZURE_COST_EXPORT_PATH;
      if (preferLiveApi() || !path) {
        if (preferLiveApi() || process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS || scope?.accountIdentifiers?.length) {
          const rows = await fetchAzureCostManagementRows(period, scope);
          return filterRows(rows, Provider.AZURE, period, scope);
        }
      }
      if (!path) {
        throw new Error(
          'Azure billing source is not configured. Set FINANCE_LIVE_BILLING=api with FINANCE_LIVE_TEST_ACCOUNT_IDS, or FINANCE_AZURE_COST_EXPORT_PATH.',
        );
      }
      const rows = await readExportFile(path);
      return filterRows(rows, Provider.AZURE, period, scope);
    },
  };
}
