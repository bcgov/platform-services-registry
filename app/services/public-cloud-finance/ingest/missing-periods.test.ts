import { filterMissingIngestPeriods, periodsToIngest } from './missing-periods';

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
});
