import { z } from 'zod';

/** Bank of Canada Valet: daily average USD expressed in CAD (1 USD → CAD). */
const BOC_FXUSDCAD_URL = 'https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1';

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

let cache: CacheEntry | null = null;

export function parseBocUsdCadResponse(payload: unknown): UsdCadExchangeRate {
  const parsed = bocObservationSchema.parse(payload);
  const observation = parsed.observations[0];
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

export async function fetchUsdCadExchangeRate(fetchImpl: typeof fetch = fetch): Promise<UsdCadExchangeRate> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  const response = await fetchImpl(BOC_FXUSDCAD_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Bank of Canada Valet request failed (${response.status})`);
  }

  const value = parseBocUsdCadResponse(await response.json());
  cache = { value, fetchedAt: Date.now() };
  return value;
}

/** Test helper — clears the in-process cache. */
export function clearUsdCadExchangeRateCache() {
  cache = null;
}
