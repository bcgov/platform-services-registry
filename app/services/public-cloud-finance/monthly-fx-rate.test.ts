import { shouldReuseStoredUsdCadRate } from './monthly-fx-rate';

describe('shouldReuseStoredUsdCadRate', () => {
  const now = new Date('2026-08-15T12:00:00');

  it('refetches the open month so MTD uses a fresh observation', () => {
    expect(
      shouldReuseStoredUsdCadRate(
        { source: 'Bank of Canada', rateDate: new Date('2026-08-01T00:00:00.000Z') },
        2026,
        8,
        now,
      ),
    ).toBe(false);
  });

  it('refetches a closed month when the stored rate is still mid-month', () => {
    expect(
      shouldReuseStoredUsdCadRate(
        { source: 'Bank of Canada', rateDate: new Date('2026-07-15T00:00:00.000Z') },
        2026,
        7,
        now,
      ),
    ).toBe(false);
  });

  it('reuses a late-month Bank of Canada rate after the month closes', () => {
    expect(
      shouldReuseStoredUsdCadRate(
        { source: 'Bank of Canada', rateDate: new Date('2026-07-31T00:00:00.000Z') },
        2026,
        7,
        now,
      ),
    ).toBe(true);
  });
});
