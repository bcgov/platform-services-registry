import { clearUsdCadExchangeRateCache, fetchUsdCadExchangeRate, parseBocUsdCadResponse } from './usd-cad-rate';

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
});
