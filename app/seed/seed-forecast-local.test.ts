import {
  applyLastPastMonthLowForecast,
  applyPastFiscalMonths,
  applyPastFiscalMonthsFromMay,
} from './seed-forecast-local';

const now = new Date('2026-08-31T12:00:00Z');

function month(year: number, monthNumber: number, amount: number) {
  return { year, month: monthNumber, amount, currency: 'CAD' as const };
}

describe('applyPastFiscalMonths from a later start', () => {
  it('fills from June and leaves April–May blank', () => {
    const values = [month(2026, 4, 0), month(2026, 5, 0), month(2026, 6, 0), month(2026, 7, 0), month(2026, 8, 4000)];
    const fromJune = applyPastFiscalMonths(values, now, 6);
    expect(fromJune.find((value) => value.month === 4)?.amount).toBe(0);
    expect(fromJune.find((value) => value.month === 5)?.amount).toBe(0);
    expect(fromJune.find((value) => value.month === 6)?.amount).toBe(4000);
    expect(fromJune.find((value) => value.month === 7)?.amount).toBe(4000);
  });
});

describe('applyPastFiscalMonthsFromMay', () => {
  it('fills May–July and leaves April blank', () => {
    const values = [month(2026, 4, 0), month(2026, 5, 0), month(2026, 6, 0), month(2026, 7, 0), month(2026, 8, 4000)];
    const fromMay = applyPastFiscalMonthsFromMay(values, now);
    const withPast = applyPastFiscalMonths(values, now);

    expect(fromMay.find((value) => value.month === 4)?.amount).toBe(0);
    expect(fromMay.find((value) => value.month === 5)?.amount).toBe(4000);
    expect(fromMay.find((value) => value.month === 7)?.amount).toBe(4000);
    expect(withPast.find((value) => value.month === 4)?.amount).toBe(4000);
  });
});

describe('applyLastPastMonthLowForecast', () => {
  it('drops only the last past forecast so that month can land over actuals', () => {
    const values = applyLastPastMonthLowForecast(
      applyPastFiscalMonthsFromMay(
        [month(2026, 4, 0), month(2026, 5, 0), month(2026, 6, 0), month(2026, 7, 0), month(2026, 8, 4000)],
        now,
      ),
      50,
      now,
    );

    expect(values.find((value) => value.month === 4)?.amount).toBe(0);
    expect(values.find((value) => value.month === 5)?.amount).toBe(4000);
    expect(values.find((value) => value.month === 6)?.amount).toBe(4000);
    expect(values.find((value) => value.month === 7)?.amount).toBe(50);
    expect(values.find((value) => value.month === 8)?.amount).toBe(4000);
  });
});
