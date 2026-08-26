import { logger } from '@/core/logging';
import { fetchWithRetry, type RequestPacer } from './http-retry';
import { periodBounds, type BillingPeriod } from './types';

export const AZURE_COST_MANAGEMENT_SCOPE = 'https://management.azure.com/.default';
export const AZURE_COST_QUERY_API_VERSION = '2023-11-01';
/** Stay under the Cost Management Query tenant cap (~20 calls / minute). */
export const AZURE_QUERY_MIN_INTERVAL_MS = 4_000;
export const AZURE_COST_QUERY_CLIENT_TYPE = 'bcgov-platform-services-registry';

export type AzureExportRow = {
  accountIdentifier: string;
  serviceLine: string;
  amount: number;
  currency?: string;
  year?: number;
  month?: number;
};

type AzureQueryPayload = {
  nextLink?: string;
  properties?: {
    nextLink?: string;
    columns?: Array<{ name: string }>;
    rows?: Array<Array<string | number>>;
  };
};

export class AzureCostQueryError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AzureCostQueryError';
    this.status = status;
  }
}

export function azureCostScopeFromEnv() {
  const raw = process.env.FINANCE_AZURE_COST_SCOPE?.trim();
  if (!raw) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function azureCostQueryUrl(scopePath: string) {
  const scope = scopePath.startsWith('/') ? scopePath : `/${scopePath}`;
  return `https://management.azure.com${scope}/providers/Microsoft.CostManagement/query?api-version=${AZURE_COST_QUERY_API_VERSION}`;
}

export function azureCostQueryBody(period: BillingPeriod, groupBySubscription: boolean) {
  const { start, endDay } = periodBounds(period);
  return {
    type: 'ActualCost',
    timeframe: 'Custom',
    timePeriod: {
      from: `${start}T00:00:00Z`,
      to: `${endDay}T23:59:59Z`,
    },
    dataset: {
      granularity: 'None',
      aggregation: { totalCost: { name: 'Cost', function: 'Sum' } },
      grouping: groupBySubscription
        ? [
            { type: 'Dimension', name: 'SubscriptionId' },
            { type: 'Dimension', name: 'ServiceName' },
          ]
        : [{ type: 'Dimension', name: 'ServiceName' }],
    },
  };
}

function columnIndex(columns: string[], ...names: string[]) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  return columns.findIndex((column) => wanted.has(column.toLowerCase()));
}

function columnName(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readAzureQueryPayload(payload: unknown): AzureQueryPayload {
  if (!isRecord(payload)) return {};
  const properties = isRecord(payload.properties) ? payload.properties : undefined;
  const columns = Array.isArray(properties?.columns)
    ? properties.columns.filter(isRecord).map((column) => ({ name: columnName(column.name) }))
    : undefined;
  const rows = Array.isArray(properties?.rows)
    ? properties.rows.filter((row): row is Array<string | number> => Array.isArray(row))
    : undefined;
  return {
    nextLink: typeof payload.nextLink === 'string' ? payload.nextLink : undefined,
    properties: {
      nextLink: typeof properties?.nextLink === 'string' ? properties.nextLink : undefined,
      columns,
      rows,
    },
  };
}

export function parseAzureCostQueryPayload(
  payload: unknown,
  period: BillingPeriod,
  fallbackSubscriptionId?: string,
): { rows: AzureExportRow[]; nextLink?: string; hasSubscriptionColumn: boolean } {
  const parsed = readAzureQueryPayload(payload);
  const columns = parsed.properties?.columns?.map((column) => column.name) ?? [];
  const costIdx = columnIndex(columns, 'Cost', 'PreTaxCost');
  const serviceIdx = columnIndex(columns, 'ServiceName');
  const currencyIdx = columnIndex(columns, 'Currency');
  const subscriptionIdx = columnIndex(columns, 'SubscriptionId', 'SubscriptionID');
  const nextLink = parsed.properties?.nextLink || parsed.nextLink;
  const hasSubscriptionColumn = subscriptionIdx >= 0;

  const rows: AzureExportRow[] = [];
  for (const row of parsed.properties?.rows ?? []) {
    const amount = Number(row[costIdx] ?? 0);
    const serviceLine = String(row[serviceIdx] ?? '');
    const accountIdentifier = subscriptionIdx >= 0 ? String(row[subscriptionIdx] ?? '') : fallbackSubscriptionId ?? '';
    const currency = currencyIdx >= 0 ? String(row[currencyIdx] ?? '').trim() : 'CAD';
    if (!accountIdentifier || !serviceLine || !Number.isFinite(amount) || amount === 0 || !currency) continue;
    rows.push({
      accountIdentifier,
      serviceLine,
      amount,
      currency,
      year: period.year,
      month: period.month,
    });
  }

  return { rows, nextLink, hasSubscriptionColumn };
}

export function isAzureScopeFallbackStatus(status: number) {
  return status === 400 || status === 401 || status === 403 || status === 404;
}

export async function fetchAzureCostQueryPages(options: {
  url: string;
  body: unknown;
  accessToken: string;
  period: BillingPeriod;
  fallbackSubscriptionId?: string;
  pacer?: RequestPacer;
  fetchImpl?: typeof fetch;
}): Promise<AzureExportRow[]> {
  const { body, accessToken, period, fallbackSubscriptionId, pacer, fetchImpl } = options;
  const rows: AzureExportRow[] = [];
  let sawSubscriptionColumn = false;
  let url = options.url;

  while (url) {
    await pacer?.wait();
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ClientType: AZURE_COST_QUERY_CLIENT_TYPE,
        },
        body: JSON.stringify(body),
      },
      {
        fetchImpl,
        maxAttempts: 8,
        onRetry: ({ status, attempt, delayMs }) => {
          logger.warn('Azure Cost Management query throttled; retrying', { status, attempt, delayMs, url });
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new AzureCostQueryError(
        response.status,
        `Azure Cost Management query failed for ${url} (${response.status}): ${text.slice(0, 500)}`,
      );
    }

    const parsed: unknown = await response.json();
    const page = parseAzureCostQueryPayload(parsed, period, fallbackSubscriptionId);
    if (page.hasSubscriptionColumn) sawSubscriptionColumn = true;
    rows.push(...page.rows);
    url = page.nextLink ?? '';
  }

  if (!fallbackSubscriptionId && !sawSubscriptionColumn) {
    throw new AzureCostQueryError(400, 'Azure Cost Management estate query did not return SubscriptionId');
  }

  return rows;
}

export function azureQueryErrorStatus(error: unknown): number | undefined {
  if (error instanceof AzureCostQueryError) return error.status;
  return undefined;
}
