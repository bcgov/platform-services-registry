import { Provider } from '@/prisma/client';
import { normalizeSourceLines } from './normalize-source-lines';

jest.mock('@/services/public-cloud-finance/monthly-fx-rate', () => ({
  ensureMonthlyUsdCadRate: jest.fn().mockResolvedValue({
    rate: 1.35,
    rateDate: new Date('2026-07-31T00:00:00.000Z'),
  }),
}));

describe('normalizeSourceLines', () => {
  const period = { year: 2026, month: 7 };

  it('converts USD lines with the month-end FX rate', async () => {
    const lines = await normalizeSourceLines(
      [{ accountIdentifier: '111122223333', serviceLine: 'AmazonEC2', amount: 10, currency: 'USD' }],
      Provider.AWS_LZA,
      period,
    );
    expect(lines).toEqual([
      expect.objectContaining({
        provider: Provider.AWS_LZA,
        accountIdentifier: '111122223333',
        serviceLine: 'AmazonEC2',
        amountCad: 13.5,
        sourceCurrency: 'USD',
        fxRate: 1.35,
      }),
    ]);
  });

  it('keeps CAD lines without an FX rate', async () => {
    const lines = await normalizeSourceLines(
      [{ accountIdentifier: 'sub-1', serviceLine: 'Virtual Machines', amount: 20, currency: 'CAD' }],
      Provider.AZURE,
      period,
    );
    expect(lines).toEqual([
      expect.objectContaining({
        amountCad: 20,
        sourceCurrency: 'CAD',
        fxRate: undefined,
      }),
    ]);
  });

  it('drops zero-amount lines', async () => {
    const lines = await normalizeSourceLines(
      [
        { accountIdentifier: 'keep', serviceLine: 'A', amount: 5, currency: 'CAD' },
        { accountIdentifier: 'keep', serviceLine: 'C', amount: 0, currency: 'CAD' },
      ],
      Provider.AZURE,
      period,
    );
    expect(lines).toEqual([expect.objectContaining({ accountIdentifier: 'keep', serviceLine: 'A', amountCad: 5 })]);
  });
});
