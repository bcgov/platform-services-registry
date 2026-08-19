import {
  calculateVariance,
  formatCadAmount,
  hasForecastValuesForRequiredHorizon,
  isLowForecastCoverage,
  sumForecastForMonths,
} from '@/components/public-cloud/finance/finance-measure-utils';
import { Provider } from '@/prisma/client';
import {
  inventDemoBillingLinks,
  normalizeBillingAccountLinks,
} from '@/services/public-cloud-finance/billing-account-links';

describe('finance measure utils', () => {
  it('treats missing forecast as no variance', () => {
    expect(calculateVariance(100, null)).toBeNull();
    expect(calculateVariance(100, 0)).toBeNull();
  });

  it('calculates variance amount and percent', () => {
    expect(calculateVariance(125, 100)).toEqual({ amount: 25, percent: 25 });
  });

  it('sums forecast only for the requested months', () => {
    const values = [
      { year: 2026, month: 4, amount: 100, currency: 'CAD' as const },
      { year: 2026, month: 5, amount: 200, currency: 'CAD' as const },
      { year: 2026, month: 6, amount: 400, currency: 'CAD' as const },
    ];
    expect(
      sumForecastForMonths(values, [
        { year: 2026, month: 4 },
        { year: 2026, month: 5 },
      ]),
    ).toBe(300);
  });

  it('formats CAD amounts and distinguishes zero from missing', () => {
    expect(formatCadAmount(null)).toBe('—');
    expect(formatCadAmount(0)).toBe('CA$0');
    expect(formatCadAmount(1234)).toBe('CA$1,234');
  });

  it('counts zero forecast months as present for coverage', () => {
    const now = new Date('2026-08-15T12:00:00Z');
    const values = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1, amount: 0, currency: 'CAD' as const };
    });
    expect(hasForecastValuesForRequiredHorizon(values, 24, now)).toBe(true);
    expect(isLowForecastCoverage(2)).toBe(true);
  });
});

describe('billing account links', () => {
  it('normalizes valid links and invents demo links without real IDs', () => {
    expect(
      normalizeBillingAccountLinks([
        { provider: Provider.AZURE, accountIdentifier: 'sub-1', environment: 'production' },
        { provider: 'NOPE', accountIdentifier: 'x' },
      ]),
    ).toEqual([{ provider: Provider.AZURE, accountIdentifier: 'sub-1', environment: 'production' }]);

    const invented = inventDemoBillingLinks('e71b0e', Provider.AZURE);
    expect(invented[0]?.accountIdentifier).toContain('demo');
  });
});
