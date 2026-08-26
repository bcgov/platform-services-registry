import { randomInt } from 'node:crypto';

const DEFAULT_MAX_ATTEMPTS = 6;
const DEFAULT_MAX_DELAY_MS = 60_000;

const RETRYABLE_STATUS = new Set([408, 429, 502, 503, 504]);

export function isRetryableStatus(status: number) {
  return RETRYABLE_STATUS.has(status);
}

export async function sleep(ms: number) {
  if (ms <= 0) return;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clampDelay(ms: number, maxDelayMs: number) {
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.min(ms, maxDelayMs);
}

function parseRetryAfterHeader(value: string, maxDelayMs: number): number | null {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return clampDelay(seconds * 1000, maxDelayMs);
  }
  const dateMs = Date.parse(value);
  if (Number.isNaN(dateMs)) return null;
  return clampDelay(dateMs - Date.now(), maxDelayMs);
}

/** Honor Retry-After / retry-after-ms; otherwise exponential backoff with jitter. */
export function retryAfterDelayMs(
  headers: Headers,
  attempt: number,
  options?: { maxDelayMs?: number; jitterMs?: number },
) {
  const maxDelayMs = options?.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const retryAfterMs = headers.get('retry-after-ms');
  if (retryAfterMs) {
    const parsed = Number(retryAfterMs);
    if (Number.isFinite(parsed) && parsed >= 0) return clampDelay(parsed, maxDelayMs);
  }

  const retryAfter = headers.get('retry-after');
  if (retryAfter) {
    const fromHeader = parseRetryAfterHeader(retryAfter, maxDelayMs);
    if (fromHeader !== null) return fromHeader;
  }

  const exp = Math.min(1000 * 2 ** Math.max(attempt - 1, 0), 30_000);
  const jitter = options?.jitterMs ?? randomInt(250);
  return clampDelay(exp + jitter, maxDelayMs);
}

export type FetchWithRetryOptions = {
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
  sleepFn?: (ms: number) => Promise<void>;
  onRetry?: (info: { status: number; attempt: number; delayMs: number; url: string }) => void;
};

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const sleepFn = options.sleepFn ?? sleep;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetchImpl(url, init);
    if (response.ok || !isRetryableStatus(response.status) || attempt === maxAttempts) {
      return response;
    }
    let delayMs = retryAfterDelayMs(response.headers, attempt);
    // Cost Management often returns 429 with no Retry-After; a 10s floor avoids burning the quota.
    if (
      response.status === 429 &&
      delayMs < 10_000 &&
      !response.headers.get('retry-after') &&
      !response.headers.get('retry-after-ms')
    ) {
      delayMs = Math.min(10_000 * 2 ** (attempt - 1), 60_000);
    }
    options.onRetry?.({ status: response.status, attempt, delayMs, url });
    await sleepFn(delayMs);
  }

  throw new Error(`fetchWithRetry exhausted attempts for ${url}`);
}

export type RequestPacer = {
  wait: () => Promise<void>;
};

/** Space outbound calls so we do not burst a quota (Azure Cost Management especially). */
export function createRequestPacer(
  minIntervalMs: number,
  sleepFn: (ms: number) => Promise<void> = sleep,
): RequestPacer {
  let nextAllowedAt = 0;
  return {
    async wait() {
      const waitMs = nextAllowedAt - Date.now();
      if (waitMs > 0) await sleepFn(waitMs);
      nextAllowedAt = Date.now() + minIntervalMs;
    },
  };
}

export async function retryOnThrow<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    sleepFn?: (ms: number) => Promise<void>;
    isRetryable?: (error: unknown) => boolean;
    delayMs?: (attempt: number, error: unknown) => number;
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const sleepFn = options.sleepFn ?? sleep;
  const isRetryable = options.isRetryable ?? ((error) => /429|throttl|too many requests/i.test(String(error)));

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === maxAttempts) throw error;
      const delayMs = options.delayMs?.(attempt, error) ?? retryAfterDelayMs(new Headers(), attempt);
      await sleepFn(delayMs);
    }
  }
  throw lastError;
}
