import { z } from 'zod';
import { fetchWithRetry } from '@/services/public-cloud-finance/ingest/http-retry';

/** Bank of Canada Valet: daily average USD expressed in CAD (1 USD → CAD). */
const BOC_FXUSDCAD_SERIES = 'FXUSDCAD';
const BOC_VALET_BASE = `https://www.bankofcanada.ca/valet/observations/${BOC_FXUSDCAD_SERIES}/json`;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const bocObservationSchema = z.object({
  observations: z
    .array(
      z.object({
        d: z.string(),
        FXUSDCAD: z.object({ v: z.string() }),
      }),
    )
    .min(1),
});

export type UsdCadExchangeRate = {
  rate: number;
  date: string;
  source: 'Bank of Canada';
};

type CacheEntry = {
  value: UsdCadExchangeRate;
  fetchedAt: number;
};

let latestCache: CacheEntry | null = null;
const monthCache = new Map<string, CacheEntry>();

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function observationToRate(observation: { d: string; FXUSDCAD: { v: string } }): UsdCadExchangeRate {
  const rate = Number(observation.FXUSDCAD.v);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid FXUSDCAD rate: ${observation.FXUSDCAD.v}`);
  }

  return {
    rate,
    date: observation.d,
    source: 'Bank of Canada',
  };
}

export function parseBocUsdCadResponse(payload: unknown): UsdCadExchangeRate {
  const parsed = bocObservationSchema.parse(payload);
  return observationToRate(parsed.observations[0]);
}

/** Prefer the last observation in the payload (month-end / invoice timing). */
export function parseBocUsdCadMonthEndResponse(payload: unknown): UsdCadExchangeRate {
  const parsed = bocObservationSchema.parse(payload);
  return observationToRate(parsed.observations[parsed.observations.length - 1]);
}

export async function fetchUsdCadExchangeRate(fetchImpl: typeof fetch = fetch): Promise<UsdCadExchangeRate> {
  if (latestCache && Date.now() - latestCache.fetchedAt < CACHE_TTL_MS) {
    return latestCache.value;
  }

  const response = await fetchWithRetry(
    `${BOC_VALET_BASE}?recent=1`,
    { headers: { Accept: 'application/json' } },
    { fetchImpl },
  );

  if (!response.ok) {
    throw new Error(`Bank of Canada Valet request failed (${response.status})`);
  }

  const value = parseBocUsdCadResponse(await response.json());
  latestCache = { value, fetchedAt: Date.now() };
  return value;
}

/**
 * Last Bank of Canada FXUSDCAD observation in the given calendar month
 * (closest available business day to month-end / invoice close).
 */
export async function fetchUsdCadExchangeRateForMonth(
  year: number,
  month: number,
  fetchImpl: typeof fetch = fetch,
): Promise<UsdCadExchangeRate> {
  const key = monthKey(year, month);
  const cached = monthCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth(year, month)).padStart(2, '0')}`;
  const url = `${BOC_VALET_BASE}?start_date=${start}&end_date=${end}`;

  const response = await fetchWithRetry(url, { headers: { Accept: 'application/json' } }, { fetchImpl });

  if (!response.ok) {
    throw new Error(`Bank of Canada Valet request failed (${response.status}) for ${key}`);
  }

  const value = parseBocUsdCadMonthEndResponse(await response.json());
  monthCache.set(key, { value, fetchedAt: Date.now() });
  return value;
}

/** Test helper — clears the in-process caches. */
export function clearUsdCadExchangeRateCache() {
  latestCache = null;
  monthCache.clear();
}
