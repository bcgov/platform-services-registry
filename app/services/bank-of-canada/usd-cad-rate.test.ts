import {
  clearUsdCadExchangeRateCache,
  fetchUsdCadExchangeRate,
  fetchUsdCadExchangeRateForMonth,
  parseBocUsdCadMonthEndResponse,
  parseBocUsdCadResponse,
} from './usd-cad-rate';

describe('parseBocUsdCadResponse', () => {
  it('parses the Valet FXUSDCAD payload', () => {
    const result = parseBocUsdCadResponse({
      observations: [{ d: '2026-07-15', FXUSDCAD: { v: '1.4049' } }],
    });

    expect(result).toEqual({
      rate: 1.4049,
      date: '2026-07-15',
      source: 'Bank of Canada',
    });
  });

  it('rejects a non-positive rate', () => {
    expect(() =>
      parseBocUsdCadResponse({
        observations: [{ d: '2026-07-15', FXUSDCAD: { v: '0' } }],
      }),
    ).toThrow(/Invalid FXUSDCAD rate/);
  });
});

describe('parseBocUsdCadMonthEndResponse', () => {
  it('uses the last observation in the month', () => {
    const result = parseBocUsdCadMonthEndResponse({
      observations: [
        { d: '2026-07-02', FXUSDCAD: { v: '1.4181' } },
        { d: '2026-07-31', FXUSDCAD: { v: '1.4029' } },
      ],
    });

    expect(result).toEqual({
      rate: 1.4029,
      date: '2026-07-31',
      source: 'Bank of Canada',
    });
  });
});

describe('fetchUsdCadExchangeRate', () => {
  beforeEach(() => {
    clearUsdCadExchangeRateCache();
  });

  it('fetches and caches the latest observation', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [{ d: '2026-07-15', FXUSDCAD: { v: '1.4049' } }],
      }),
    });

    const first = await fetchUsdCadExchangeRate(fetchImpl as unknown as typeof fetch);
    const second = await fetchUsdCadExchangeRate(fetchImpl as unknown as typeof fetch);

    expect(first.rate).toBe(1.4049);
    expect(second.rate).toBe(1.4049);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries a throttled Valet response', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'retry-after': '0' }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          observations: [{ d: '2026-07-15', FXUSDCAD: { v: '1.4049' } }],
        }),
      });

    const result = await fetchUsdCadExchangeRate(fetchImpl as unknown as typeof fetch);
    expect(result.rate).toBe(1.4049);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('fetchUsdCadExchangeRateForMonth', () => {
  beforeEach(() => {
    clearUsdCadExchangeRateCache();
  });

  it('requests the calendar month range and returns month-end', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [
          { d: '2026-07-02', FXUSDCAD: { v: '1.4181' } },
          { d: '2026-07-31', FXUSDCAD: { v: '1.4029' } },
        ],
      }),
    });

    const result = await fetchUsdCadExchangeRateForMonth(2026, 7, fetchImpl as unknown as typeof fetch);

    expect(result.rate).toBe(1.4029);
    expect(result.date).toBe('2026-07-31');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?start_date=2026-07-01&end_date=2026-07-31',
      expect.any(Object),
    );
  });
});
