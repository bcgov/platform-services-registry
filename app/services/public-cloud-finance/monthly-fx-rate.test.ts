import prisma from '@/core/prisma';
import { fetchUsdCadExchangeRate, fetchUsdCadExchangeRateForMonth } from '@/services/bank-of-canada/usd-cad-rate';
import {
  ensureMonthlyUsdCadRate,
  fetchUsdCadForIngestMonth,
  shouldReuseStoredUsdCadRate,
  USD_CAD_PAIR,
} from './monthly-fx-rate';

jest.mock('@/services/bank-of-canada/usd-cad-rate', () => ({
  fetchUsdCadExchangeRateForMonth: jest.fn(),
  fetchUsdCadExchangeRate: jest.fn(),
}));

const mockMonth = fetchUsdCadExchangeRateForMonth as jest.MockedFunction<typeof fetchUsdCadExchangeRateForMonth>;
const mockLatest = fetchUsdCadExchangeRate as jest.MockedFunction<typeof fetchUsdCadExchangeRate>;

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

describe('fetchUsdCadForIngestMonth fallbacks', () => {
  const now = new Date('2026-08-15T12:00:00');

  afterEach(() => {
    mockMonth.mockReset();
    mockLatest.mockReset();
  });

  it('uses the latest published rate only for the open month', async () => {
    mockMonth.mockRejectedValue(new Error('no observations'));
    mockLatest.mockResolvedValue({ rate: 1.37, date: '2026-08-14', source: 'Bank of Canada' });
    await expect(fetchUsdCadForIngestMonth(2026, 8, now)).resolves.toEqual({
      rate: 1.37,
      date: '2026-08-14',
      source: 'Bank of Canada',
    });
    expect(mockLatest).toHaveBeenCalled();
  });

  it('does not fall back to the latest rate for a closed month', async () => {
    mockMonth.mockRejectedValue(new Error('no observations'));
    await expect(fetchUsdCadForIngestMonth(2026, 7, now)).rejects.toThrow('no observations');
    expect(mockLatest).not.toHaveBeenCalled();
  });
});

describe('ensureMonthlyUsdCadRate env fallback', () => {
  const now = new Date('2026-08-15T12:00:00');
  const previous = process.env.FINANCE_USD_CAD_RATE;

  afterEach(async () => {
    mockMonth.mockReset();
    mockLatest.mockReset();
    if (previous === undefined) delete process.env.FINANCE_USD_CAD_RATE;
    else process.env.FINANCE_USD_CAD_RATE = previous;
    await prisma.monthlyFxRate.deleteMany({ where: { pair: USD_CAD_PAIR, year: 2099 } });
  });

  it('does not persist FINANCE_USD_CAD_RATE for a closed month', async () => {
    process.env.FINANCE_USD_CAD_RATE = '1.41';
    mockMonth.mockRejectedValue(new Error('valet down'));
    mockLatest.mockRejectedValue(new Error('latest down'));
    await expect(ensureMonthlyUsdCadRate(2099, 7, now)).rejects.toThrow('valet down');
    expect(await prisma.monthlyFxRate.findFirst({ where: { pair: USD_CAD_PAIR, year: 2099, month: 7 } })).toBeNull();
  });

  it('persists FINANCE_USD_CAD_RATE only for the open month', async () => {
    process.env.FINANCE_USD_CAD_RATE = '1.41';
    mockMonth.mockRejectedValue(new Error('valet down'));
    mockLatest.mockRejectedValue(new Error('latest down'));
    const stored = await ensureMonthlyUsdCadRate(2026, 8, now);
    expect(stored.rate).toBe(1.41);
    expect(stored.source).toBe('FINANCE_USD_CAD_RATE');
  });
});
