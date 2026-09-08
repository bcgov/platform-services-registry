import { fetchWithRetry, isRetryableStatus, retryAfterDelayMs } from './http-retry';

function jsonResponse(status: number, headers?: Record<string, string>, body = '') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => body,
    json: async () => (body ? JSON.parse(body) : {}),
  } as Response;
}

describe('http-retry', () => {
  it('treats 429 and 503 as retryable', () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(400)).toBe(false);
  });

  it('honors Retry-After seconds and retry-after-ms', () => {
    expect(retryAfterDelayMs(new Headers({ 'retry-after': '2' }), 1)).toBe(2000);
    expect(retryAfterDelayMs(new Headers({ 'retry-after-ms': '1500' }), 1)).toBe(1500);
  });

  it('retries 429 then returns the successful response', async () => {
    const sleepFn = jest.fn().mockResolvedValue(undefined);
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, { 'retry-after': '0' }, 'throttled'))
      .mockResolvedValueOnce(jsonResponse(200, {}, '{"ok":true}'));

    const response = await fetchWithRetry(
      'https://example.test/query',
      { method: 'POST' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, sleepFn, maxAttempts: 3 },
    );

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleepFn).toHaveBeenCalledWith(0);
  });

  it('does not retry a 400', async () => {
    const sleepFn = jest.fn().mockResolvedValue(undefined);
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(400, {}, 'bad'));

    const response = await fetchWithRetry(
      'https://example.test/query',
      { method: 'POST' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, sleepFn },
    );

    expect(response.status).toBe(400);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleepFn).not.toHaveBeenCalled();
  });

  it('gives up after maxAttempts', async () => {
    const sleepFn = jest.fn().mockResolvedValue(undefined);
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(429, { 'retry-after': '0' }, 'throttled'));

    const response = await fetchWithRetry(
      'https://example.test/query',
      { method: 'POST' },
      { fetchImpl: fetchImpl as unknown as typeof fetch, sleepFn, maxAttempts: 3 },
    );

    expect(response.status).toBe(429);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
