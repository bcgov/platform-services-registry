import {
  buildIngestionFreshness,
  calculateVariance,
  failedIngestProviders,
  formatCadAmount,
  formatIngestionFreshnessLine,
  hasForecastValuesForRequiredHorizon,
  isLowForecastCoverage,
  sumForecastForMonths,
  sumKnownActualsOrNull,
  expectedPastActualMonths,
  productExistedDuringMonth,
  summarizeYtdActuals,
  ytdActualHint,
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

  it('treats missing YTD rollups as null, not zero', () => {
    const ytd = [
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
    ];
    expect(summarizeYtdActuals(ytd, [])).toEqual({
      fytdActual: null,
      presentMonths: 0,
      expectedMonths: 2,
    });
  });

  it('keeps a partial YTD total and reports missing months', () => {
    const summary = summarizeYtdActuals(
      [
        { year: 2026, month: 4 },
        { year: 2026, month: 5 },
        { year: 2026, month: 6 },
      ],
      [
        { year: 2026, month: 4, amountCad: 10 },
        { year: 2026, month: 4, amountCad: 5 },
        { year: 2026, month: 7, amountCad: 99 },
      ],
    );
    expect(summary).toEqual({ fytdActual: 15, presentMonths: 1, expectedMonths: 3 });
    expect(ytdActualHint(summary, { year: 2026, month: 6 })).toBe('incomplete (1 of 3 months)');
  });

  it('does not treat pre-creation months as missing actuals', () => {
    const started = new Date('2026-08-15T00:00:00Z');
    expect(productExistedDuringMonth(started, 2026, 7)).toBe(false);
    expect(
      expectedPastActualMonths(
        [
          { year: 2026, month: 6 },
          { year: 2026, month: 7 },
          { year: 2026, month: 8 },
          { year: 2026, month: 9 },
        ],
        started,
        new Date('2026-09-15T12:00:00'),
      ),
    ).toEqual([{ year: 2026, month: 8 }]);
  });

  it('explains empty expected months when elapsed FY months exist', () => {
    expect(ytdActualHint({ presentMonths: 0, expectedMonths: 0, elapsedMonths: 4 }, { year: 2026, month: 7 })).toBe(
      'No products existed through last complete month',
    );
  });

  it('surfaces a failed ingest after an older success', () => {
    const freshness = buildIngestionFreshness(
      'AZURE',
      { status: 'FAILED', completedAt: '2026-08-26T13:00:00.000Z', errorMessage: '429' },
      '2026-08-20T06:15:00.000Z',
    );
    expect(freshness.lastSuccessAt).toBe('2026-08-20T06:15:00.000Z');
    expect(freshness.latest?.status).toBe('FAILED');
    expect(formatIngestionFreshnessLine(freshness)).toContain('last run failed');
    expect(failedIngestProviders([freshness, buildIngestionFreshness('AWS_LZA', null, null)])).toEqual(['AZURE']);
  });

  it('sums only known actuals', () => {
    expect(sumKnownActualsOrNull([null, undefined])).toBeNull();
    expect(sumKnownActualsOrNull([null, 10, 5])).toBe(15);
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
