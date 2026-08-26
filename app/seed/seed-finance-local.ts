/**
 * Seed simulated public-cloud actuals through the real ingest pipeline.
 * Run: pnpm run seed-finance-local [--reset]
 *
 * Invented product/ministry names and fake account IDs only.
 * Populates April through July as actuals (and later months through "today" when past July).
 */
import prisma from '../core/prisma';
import { Provider } from '../prisma/client';
import { ingestBillingPeriod } from '../services/public-cloud-finance/ingest/run-ingest';
import { createSimulatedBillingSource } from '../services/public-cloud-finance/ingest/simulated-source';

function nextCalendarMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

function isAfterMonth(left: { year: number; month: number }, right: { year: number; month: number }) {
  return left.year > right.year || (left.year === right.year && left.month > right.month);
}

export function buildActualPeriods(now = new Date()) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  // At least Apr–Jul in the current FY; after New Year keep going through today
  // so prior-year Aug–Dec are not dropped.
  const start = { year: month >= 4 ? year : year - 1, month: 4 };
  const end = { year, month: month >= 4 ? Math.max(7, month) : month };
  const periods: Array<{ year: number; month: number }> = [];
  for (let cursor = start; !isAfterMonth(cursor, end); cursor = nextCalendarMonth(cursor.year, cursor.month)) {
    periods.push(cursor);
  }
  return periods;
}

export async function seedFinanceActualsLocal(options?: { reset?: boolean }) {
  const reset = options?.reset ?? false;
  console.log('=== Local finance actuals seed (simulated) ===\n');

  if (reset) {
    console.log('Resetting finance collections...');
    await prisma.actualSpend.deleteMany({});
    await prisma.unmatchedBillingLine.deleteMany({});
    await prisma.monthlyProductSpendRollup.deleteMany({});
    await prisma.spendFlag.deleteMany({});
    await prisma.ingestionLock.deleteMany({});
    await prisma.ingestionRun.deleteMany({});
    await prisma.monthlyFxRate.deleteMany({});
    await prisma.varianceNote.deleteMany({});
  }

  const periods = buildActualPeriods();
  const source = createSimulatedBillingSource();
  const providers = [Provider.AZURE, Provider.AWS_LZA];

  for (const period of periods) {
    for (const provider of providers) {
      const result = await ingestBillingPeriod({
        provider,
        period,
        triggeredBy: 'seed-finance-local',
        source,
      });
      console.log(
        `  ${provider} ${period.year}-${String(period.month).padStart(2, '0')}: loaded=${result.rowsLoaded} unmatched=${
          result.rowsUnmatched
        } flags=${result.flagsRaised}`,
      );
    }
  }

  console.log('\nEdge cases covered in seed/simulation:');
  console.log('  - aa0002 / bb0002: missing forecast (from forecast seed profiles)');
  console.log('  - a1c2d3 / b4e5f6: incomplete / negative variance pattern');
  console.log('  - e71b0e: large positive variance / storage growth');
  console.log('  - f82c1a: MoM spike in July');
  console.log('  - aa0003: July month with no data');
  console.log('\nFinance snapshot: http://localhost:3000/public-cloud/finance');
}

async function main() {
  await seedFinanceActualsLocal({ reset: process.argv.includes('--reset') });
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
