import prisma from '@/core/prisma';
import { Provider } from '@/prisma/client';
import {
  assertClassicAwsRealIngestAllowed,
  elapsedCompleteFyMonths,
  filterMissingIngestPeriods,
  listScheduledIngestPlan,
  periodsToIngest,
} from './missing-periods';

describe('missing ingest periods', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lists elapsed complete months in the fiscal year through the target', () => {
    expect(elapsedCompleteFyMonths({ year: 2026, month: 7 })).toEqual([
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
      { year: 2026, month: 7 },
    ]);
    expect(elapsedCompleteFyMonths({ year: 2026, month: 3 })).toEqual([
      { year: 2025, month: 4 },
      { year: 2025, month: 5 },
      { year: 2025, month: 6 },
      { year: 2025, month: 7 },
      { year: 2025, month: 8 },
      { year: 2025, month: 9 },
      { year: 2025, month: 10 },
      { year: 2025, month: 11 },
      { year: 2025, month: 12 },
      { year: 2026, month: 1 },
      { year: 2026, month: 2 },
      { year: 2026, month: 3 },
    ]);
  });

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

  it('rejects classic AWS', () => {
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AWS)).toThrow(/AWS_LZA/);
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AWS_LZA)).not.toThrow();
    expect(() => assertClassicAwsRealIngestAllowed(Provider.AZURE)).not.toThrow();
  });

  it('plans unscoped SUCCESS months as done and always refreshes the target month', async () => {
    const findMany = jest.spyOn(prisma.ingestionRun, 'findMany').mockImplementation(async ({ where }) => {
      if (where?.provider !== Provider.AWS_LZA) return [];
      return [{ periodStart: new Date(Date.UTC(2026, 3, 1)) }] as Awaited<
        ReturnType<typeof prisma.ingestionRun.findMany>
      >;
    });

    const plan = await listScheduledIngestPlan({ year: 2026, month: 6 });
    const aws = plan.providers.find((item) => item.provider === Provider.AWS_LZA);
    const azure = plan.providers.find((item) => item.provider === Provider.AZURE);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ provider: Provider.AWS_LZA, isScoped: false }),
      }),
    );
    expect(aws?.periods).toEqual([
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
    ]);
    expect(azure?.periods).toEqual([
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
    ]);
  });
});
