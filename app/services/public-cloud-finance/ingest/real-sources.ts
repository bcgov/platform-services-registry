import { spawn } from 'node:child_process';
import prisma from '@/core/prisma';
import { Provider, ProjectStatus } from '@/prisma/client';
import { resolveBillingAccountIdentifiers } from '@/services/public-cloud-finance/billing-account-links';
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

const AZURE_COST_MANAGEMENT_SCOPE = 'https://management.azure.com/.default';
const AZURE_COST_QUERY_API_VERSION = '2023-11-01';

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
    // No conversion — omit FX fields so CAD rows stay deterministic.
    return { amountCad: amount };
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
    throw new TypeError(`Billing export at ${path} must be a JSON array`);
  }
  return parsed as ExportRow[];
}

function preferLiveApi() {
  const mode = (process.env.FINANCE_LIVE_BILLING || '').toLowerCase();
  return mode === 'api' || mode === 'live' || mode === '1' || mode === 'true';
}

function awsProfileName() {
  return process.env.FINANCE_AWS_PROFILE || process.env.AWS_PROFILE || '';
}

/** Local CLI profile and/or Vault-injected keys / role. */
function hasAwsLiveCredentials() {
  return Boolean(
    awsProfileName() ||
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
      process.env.AWS_WEB_IDENTITY_TOKEN_FILE ||
      process.env.AWS_ROLE_ARN,
  );
}

/** Vault SP env and/or local `az login` via DefaultAzureCredential. */
function hasAzureLiveCredentials() {
  return Boolean(
    preferLiveApi() ||
      (process.env.AZURE_CLIENT_ID && process.env.AZURE_TENANT_ID) ||
      process.env.AZURE_FEDERATED_TOKEN_FILE,
  );
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

async function createAwsCostExplorerClient() {
  const { CostExplorerClient } = await import('@aws-sdk/client-cost-explorer');
  const region = process.env.FINANCE_AWS_REGION || process.env.AWS_REGION || 'ca-central-1';
  const profile = awsProfileName();

  // Local testing: explicit SSO/shared profile. Test/Prod: default chain (Vault env keys / IRSA).
  if (profile) {
    const { fromIni } = await import('@aws-sdk/credential-providers');
    return new CostExplorerClient({ region, credentials: fromIni({ profile }) });
  }

  return new CostExplorerClient({ region });
}

async function fetchAwsCostExplorerRows(
  provider: Provider,
  period: BillingPeriod,
  scope?: BillingFetchScope,
): Promise<ExportRow[]> {
  const { GetCostAndUsageCommand } = await import('@aws-sdk/client-cost-explorer');
  const client = await createAwsCostExplorerClient();

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
      `${provider} Cost Explorer returned no non-zero rows for ${period.year}-${period.month}. Check AWS credentials / permissions.`,
    );
  }
  return rows;
}

async function resolveAzureSubscriptionIds(scope?: BillingFetchScope): Promise<string[]> {
  if (scope?.accountIdentifiers?.length) {
    return [...new Set(scope.accountIdentifiers)];
  }

  const fromEnv = (process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) {
    return [...new Set(fromEnv)];
  }

  const products = await prisma.publicCloudProduct.findMany({
    where: {
      status: ProjectStatus.ACTIVE,
      provider: Provider.AZURE,
      ...(scope?.licencePlates?.length ? { licencePlate: { in: scope.licencePlates } } : {}),
    },
    select: {
      licencePlate: true,
      provider: true,
      billingAccountLinks: true,
      azureSubscriptions: true,
    },
  });

  const ids = products.flatMap((product) =>
    resolveBillingAccountIdentifiers(product).map((link) => link.accountIdentifier),
  );
  return [...new Set(ids)];
}

async function getAzureManagementToken(): Promise<string> {
  const { DefaultAzureCredential } = await import('@azure/identity');
  // Covers Vault SP env (AZURE_CLIENT_ID/TENANT_ID/CLIENT_SECRET) and local `az login`.
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(AZURE_COST_MANAGEMENT_SCOPE);
  if (!token?.token) {
    throw new Error(
      'Unable to acquire Azure management token. Configure AZURE_CLIENT_ID/AZURE_TENANT_ID/AZURE_CLIENT_SECRET or run `az login`.',
    );
  }
  return token.token;
}

async function fetchAzureCostManagementViaRest(
  subscriptionId: string,
  period: BillingPeriod,
  accessToken: string,
): Promise<ExportRow[]> {
  const { start, endDay } = periodBounds(period);
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

  const url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=${AZURE_COST_QUERY_API_VERSION}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Azure Cost Management query failed for ${subscriptionId} (${response.status}): ${text.slice(0, 500)}`,
    );
  }

  const parsed = (await response.json()) as {
    properties?: { columns?: Array<{ name: string }>; rows?: Array<Array<string | number>> };
  };
  const columns = parsed.properties?.columns?.map((c) => c.name) ?? [];
  const costIdx = columns.indexOf('Cost');
  const serviceIdx = columns.indexOf('ServiceName');
  const currencyIdx = columns.indexOf('Currency');

  const rows: ExportRow[] = [];
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
  return rows;
}

/** Fallback for local when DefaultAzureCredential is unavailable but `az` CLI works. */
async function fetchAzureCostManagementViaAzCli(subscriptionId: string, period: BillingPeriod): Promise<ExportRow[]> {
  const { start, endDay } = periodBounds(period);
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
    `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=${AZURE_COST_QUERY_API_VERSION}`,
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

  const rows: ExportRow[] = [];
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
  return rows;
}

async function fetchAzureCostManagementRows(period: BillingPeriod, scope?: BillingFetchScope): Promise<ExportRow[]> {
  const subscriptionIds = await resolveAzureSubscriptionIds(scope);
  if (subscriptionIds.length === 0) {
    throw new Error(
      'Azure live billing found no subscription IDs. Set product azureSubscriptions / billingAccountLinks, scope.accountIdentifiers, or FINANCE_LIVE_TEST_ACCOUNT_IDS.',
    );
  }

  let accessToken: string | null = null;
  try {
    accessToken = await getAzureManagementToken();
  } catch {
    // Fall through to `az rest` for local CLI-only sessions.
    accessToken = null;
  }

  const rows: ExportRow[] = [];
  for (const subscriptionId of subscriptionIds) {
    if (accessToken) {
      rows.push(...(await fetchAzureCostManagementViaRest(subscriptionId, period, accessToken)));
    } else {
      rows.push(...(await fetchAzureCostManagementViaAzCli(subscriptionId, period)));
    }
  }

  if (rows.length === 0) {
    throw new Error(`Azure Cost Management returned no non-zero rows for ${period.year}-${period.month}.`);
  }
  return rows;
}

/**
 * Real AWS / AWS_LZA billing adapter.
 * Live Cost Explorer when FINANCE_LIVE_BILLING=api (or credentials present):
 * - Local: FINANCE_AWS_PROFILE / AWS_PROFILE (SSO)
 * - Test/Prod: Vault-injected AWS_ACCESS_KEY_ID / secret (default chain)
 * Falls back to JSON export path FINANCE_AWS_COST_EXPORT_PATH / FINANCE_AWS_LZA_COST_EXPORT_PATH.
 */
export function createAwsBillingSource(provider: Provider = Provider.AWS): BillingSource {
  const envKey = provider === Provider.AWS_LZA ? 'FINANCE_AWS_LZA_COST_EXPORT_PATH' : 'FINANCE_AWS_COST_EXPORT_PATH';
  return {
    name: provider === Provider.AWS_LZA ? 'aws-lza' : 'aws',
    async fetchBillingLines(period, scope) {
      const path = process.env[envKey] || process.env.FINANCE_AWS_COST_EXPORT_PATH;
      if (preferLiveApi() || hasAwsLiveCredentials() || !path) {
        if (preferLiveApi() || hasAwsLiveCredentials()) {
          const rows = await fetchAwsCostExplorerRows(provider, period, scope);
          return filterRows(rows, provider, period, scope);
        }
      }
      if (!path) {
        throw new Error(
          `${provider} billing source is not configured. Set FINANCE_LIVE_BILLING=api with AWS profile or Vault AWS_* keys, or ${envKey}.`,
        );
      }
      const rows = await readExportFile(path);
      return filterRows(rows, provider, period, scope);
    },
  };
}

/**
 * Real Azure Cost Management adapter.
 * Live query when FINANCE_LIVE_BILLING=api (or SP env present):
 * - Local: DefaultAzureCredential / `az login` (az rest fallback)
 * - Test/Prod: AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_CLIENT_SECRET from Vault
 * Falls back to FINANCE_AZURE_COST_EXPORT_PATH JSON.
 */
export function createAzureBillingSource(): BillingSource {
  return {
    name: 'azure',
    async fetchBillingLines(period, scope) {
      const path = process.env.FINANCE_AZURE_COST_EXPORT_PATH;
      if (preferLiveApi() || hasAzureLiveCredentials() || !path) {
        if (preferLiveApi() || hasAzureLiveCredentials() || scope?.accountIdentifiers?.length) {
          const rows = await fetchAzureCostManagementRows(period, scope);
          return filterRows(rows, Provider.AZURE, period, scope);
        }
      }
      if (!path) {
        throw new Error(
          'Azure billing source is not configured. Set FINANCE_LIVE_BILLING=api with Azure SP env / `az login`, or FINANCE_AZURE_COST_EXPORT_PATH.',
        );
      }
      const rows = await readExportFile(path);
      return filterRows(rows, Provider.AZURE, period, scope);
    },
  };
}
