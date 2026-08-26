import { spawn } from 'node:child_process';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { Provider } from '@/prisma/client';
import { convertCurrencyAmount, type CurrencyCode } from '@/services/exchange-rates';
import { resolveBillingAccountIdentifiers } from '@/services/public-cloud-finance/billing-account-links';
import { ensureMonthlyUsdCadRate } from '@/services/public-cloud-finance/monthly-fx-rate';
import { createAwsCostExplorerClient, fetchAwsCostExplorerPages, type AwsExportRow } from './aws-cost-explorer';
import {
  AZURE_COST_MANAGEMENT_SCOPE,
  AZURE_QUERY_MIN_INTERVAL_MS,
  azureCostQueryBody,
  azureCostQueryUrl,
  azureCostScopeFromEnv,
  azureQueryErrorStatus,
  fetchAzureCostQueryPages,
  isAzureScopeFallbackStatus,
  parseAzureCostQueryPayload,
  type AzureExportRow,
} from './azure-cost-query';
import { createRequestPacer, retryOnThrow } from './http-retry';
import { isScopedAzureFetch } from './missing-periods';
import type { BillingFetchScope, BillingPeriod, BillingSource, NormalizedBillingLine } from './types';

type ExportRow = AwsExportRow | AzureExportRow;

type FxContext = { rate: number; rateDate: Date };

function toCad(
  amount: number,
  currency: string | undefined,
  fx: FxContext | null,
): { amountCad: number; fxRate?: number; fxRateDate?: Date } {
  const sourceCurrency = (currency ?? 'CAD').toUpperCase();
  if (sourceCurrency !== 'CAD' && sourceCurrency !== 'USD') {
    throw new Error(`Unsupported billing currency: ${sourceCurrency}`);
  }
  if (sourceCurrency === 'CAD') {
    return { amountCad: convertCurrencyAmount(amount, 'CAD', 'CAD') };
  }
  if (!fx) {
    throw new Error('USD→CAD conversion requires a month-end FX rate from Bank of Canada');
  }
  return {
    amountCad: convertCurrencyAmount(amount, 'USD' as CurrencyCode, 'CAD', fx.rate),
    fxRate: fx.rate,
    fxRateDate: fx.rateDate,
  };
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
  const accountFilter = scope?.accountIdentifiers?.length
    ? new Set(scope.accountIdentifiers.map((id) => id.toLowerCase()))
    : null;
  const filtered = rows
    .filter((row) => (!row.year || row.year === period.year) && (!row.month || row.month === period.month))
    .filter((row) => !accountFilter || accountFilter.has(row.accountIdentifier.toLowerCase()));
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

async function fetchAwsCostExplorerRows(
  provider: Provider,
  period: BillingPeriod,
  scope?: BillingFetchScope,
): Promise<ExportRow[]> {
  const region = process.env.FINANCE_AWS_REGION || process.env.AWS_REGION || 'ca-central-1';
  const client = await createAwsCostExplorerClient({ region, profile: awsProfileName() || undefined });
  const rows = await fetchAwsCostExplorerPages(client, period, scope?.accountIdentifiers);

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

  const products = await prisma.publicCloudProduct.findMany({
    where: {
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
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(AZURE_COST_MANAGEMENT_SCOPE);
  if (!token?.token) {
    throw new Error(
      'Unable to acquire Azure management token. Configure AZURE_CLIENT_ID/AZURE_TENANT_ID/AZURE_CLIENT_SECRET or run `az login`.',
    );
  }
  return token.token;
}

async function fetchAzureCostManagementViaAzCli(subscriptionId: string, period: BillingPeriod): Promise<ExportRow[]> {
  const body = azureCostQueryBody(period, false);
  const stdout = await retryOnThrow(
    () =>
      runCommand('az', [
        'rest',
        '--method',
        'post',
        '--url',
        azureCostQueryUrl(`/subscriptions/${subscriptionId}`),
        '--body',
        JSON.stringify(body),
      ]),
    {
      isRetryable: (error) => /429|throttl|too many requests/i.test(String(error)),
    },
  );

  const parsed: unknown = JSON.parse(stdout);
  return parseAzureCostQueryPayload(parsed, period, subscriptionId).rows;
}

async function fetchAzureRowsAtEstateScope(period: BillingPeriod, accessToken: string): Promise<ExportRow[] | null> {
  const estateScope = azureCostScopeFromEnv();
  if (!estateScope) return null;

  try {
    const rows = await fetchAzureCostQueryPages({
      url: azureCostQueryUrl(estateScope),
      body: azureCostQueryBody(period, true),
      accessToken,
      period,
    });
    return rows;
  } catch (error) {
    const status = azureQueryErrorStatus(error);
    if (status && isAzureScopeFallbackStatus(status)) {
      logger.warn('Azure estate cost scope unavailable; falling back to per-subscription queries', {
        status,
        scope: estateScope,
      });
      return null;
    }
    throw error;
  }
}

async function fetchAzureRowsPerSubscription(
  period: BillingPeriod,
  subscriptionIds: string[],
  accessToken: string | null,
): Promise<ExportRow[]> {
  const pacer = createRequestPacer(AZURE_QUERY_MIN_INTERVAL_MS);
  const rows: ExportRow[] = [];
  for (const subscriptionId of subscriptionIds) {
    if (accessToken) {
      rows.push(
        ...(await fetchAzureCostQueryPages({
          url: azureCostQueryUrl(`/subscriptions/${subscriptionId}`),
          body: azureCostQueryBody(period, false),
          accessToken,
          period,
          fallbackSubscriptionId: subscriptionId,
          pacer,
        })),
      );
    } else {
      await pacer.wait();
      rows.push(...(await fetchAzureCostManagementViaAzCli(subscriptionId, period)));
    }
  }
  return rows;
}

async function fetchAzureCostManagementRows(period: BillingPeriod, scope?: BillingFetchScope): Promise<ExportRow[]> {
  const subscriptionIds = await resolveAzureSubscriptionIds(scope);
  if (subscriptionIds.length === 0) {
    throw new Error(
      'Azure live billing found no subscription IDs. Set product azureSubscriptions / billingAccountLinks, or pass scope.accountIdentifiers.',
    );
  }

  let accessToken: string | null = null;
  try {
    accessToken = await getAzureManagementToken();
  } catch {
    accessToken = null;
  }

  const scoped = isScopedAzureFetch(scope);
  if (!scoped && !azureCostScopeFromEnv()) {
    throw new Error(
      'FINANCE_AZURE_COST_SCOPE is required for estate Azure ingest. Per-subscription fallback is only allowed for scoped live tests.',
    );
  }

  let rows: ExportRow[] = [];
  if (accessToken) {
    const estateRows = await fetchAzureRowsAtEstateScope(period, accessToken);
    if (estateRows) {
      rows = estateRows;
    } else if (scoped) {
      rows = await fetchAzureRowsPerSubscription(period, subscriptionIds, accessToken);
    } else {
      throw new Error(
        'Azure estate cost scope is unavailable. Refusing per-subscription fallback for full-estate ingest.',
      );
    }
  } else if (scoped) {
    rows = await fetchAzureRowsPerSubscription(period, subscriptionIds, null);
  } else {
    throw new Error(
      'Unable to acquire an Azure management token for estate ingest. Configure AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_CLIENT_SECRET.',
    );
  }

  if (rows.length === 0) {
    throw new Error(`Azure Cost Management returned no non-zero rows for ${period.year}-${period.month}.`);
  }
  return rows;
}

/**
 * Real AWS_LZA billing adapter. Classic AWS is out of scope for real ingest.
 * One Cost Explorer query per month (paginated, adaptive retries), optionally chunked
 * by LINKED_ACCOUNT when a live allowlist is set.
 */
export function createAwsBillingSource(provider: Provider = Provider.AWS_LZA): BillingSource {
  if (provider !== Provider.AWS_LZA) {
    throw new Error('Real AWS billing is AWS_LZA only.');
  }
  const envKey = 'FINANCE_AWS_LZA_COST_EXPORT_PATH';
  return {
    name: 'aws-lza',
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
 * Estate ingest requires FINANCE_AZURE_COST_SCOPE. Scoped live tests may fall back to
 * paced per-subscription queries with 429 retries.
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
