import { Provider } from '@/prisma/client';
import {
  assertClassicAwsRealIngestAllowed,
  filterMissingIngestPeriods,
  isScopedAzureFetch,
  periodsToIngest,
} from './missing-periods';

describe('missing ingest periods', () => {
  it('returns elapsed months with no successful run', () => {
    expect(
      filterMissingIngestPeriods(
        [
          { year: 2026, month: 4 },
          { year: 2026, month: 5 },
          { year: 2026, month: 6 },
        ],
        [{ year: 2026, month: 4 }],
      ),
    ).toEqual([
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
    ]);
  });

  it('always includes the target month even when it already succeeded', () => {
    expect(periodsToIngest([{ year: 2026, month: 4 }], { year: 2026, month: 7 })).toEqual([
      { year: 2026, month: 4 },
      { year: 2026, month: 7 },
    ]);
  });

  it('does not duplicate the target when it is already missing', () => {
    expect(
      periodsToIngest(
        [
          { year: 2026, month: 6 },
          { year: 2026, month: 7 },
        ],
        { year: 2026, month: 7 },
      ),
    ).toEqual([
      { year: 2026, month: 6 },
      { year: 2026, month: 7 },
    ]);
  });

  it('rejects classic AWS on the real Cost Explorer path unless a source is forced', () => {
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AWS, { billingSource: 'real' })).toThrow(/AWS_LZA/);
    expect(() =>
      assertClassicAwsRealIngestAllowed(Provider.AWS, { forcedSource: true, billingSource: 'real' }),
    ).not.toThrow();
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AWS_LZA, { billingSource: 'real' })).not.toThrow();
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AWS, { billingSource: 'simulated' })).not.toThrow();
  });

  it('does not treat FINANCE_LIVE_TEST_ACCOUNT_IDS as a scoped fetch', () => {
    const previous = process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS;
    process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS = 'sub-1';
    expect(isScopedAzureFetch(undefined)).toBe(false);
    expect(isScopedAzureFetch({ licencePlates: ['abc'] })).toBe(true);
    if (previous === undefined) delete process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS;
    else process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS = previous;
  });
});
