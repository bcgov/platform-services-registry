import {
  applyAmountToFutureMonths,
  buildFiscalForecastMonths,
  buildRollingFiscalForecastMonths,
  copyAmountAcrossEditableMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  formatFiscalYearLabel,
  getFiscalYearChunks,
  getFiscalYearStartYear,
  getCellStatuses,
  getForecastIncreases,
  getProviderSpendLabel,
  isForecastHorizonComplete,
  isPartialFiscalYearChunk,
  mergeMonthlyValuesOntoFiscalHorizon,
  preserveLockedPastMonthlyValues,
  type ForecastCellStatus,
  type MonthlyValue,
} from './forecast-grid-utils';

describe('fiscal year helpers', () => {
  const june2026 = new Date(2026, 5, 15);

  it('labels fiscal years as FY26/27', () => {
    expect(formatFiscalYearLabel(2026)).toBe('FY26/27');
    expect(formatFiscalYearLabel(2025)).toBe('FY25/26');
  });

  it('starts fiscal year in April', () => {
    expect(getFiscalYearStartYear(new Date(2026, 2, 1))).toBe(2025);
    expect(getFiscalYearStartYear(new Date(2026, 3, 1))).toBe(2026);
  });

  it('defaults to a rolling 24-month horizon', () => {
    expect(FISCAL_FORECAST_HORIZON_MONTHS).toBe(24);
  });

  it('builds 2 fiscal years from April', () => {
    const months = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    expect(months.length).toBe(24);
    expect(months[0]).toMatchObject({ year: 2026, month: 4, amount: 1000 });
    expect(months[11]).toMatchObject({ year: 2027, month: 3 });
    expect(months[12]).toMatchObject({ year: 2027, month: 4 });
  });

  it('builds a rolling grid covering 24 months from the current month', () => {
    // June 2026: Apr '26 – May '28 (2 past months + 24 rolling months = 26 slots).
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    expect(months.length).toBe(26);
    expect(months[0]).toMatchObject({ year: 2026, month: 4 });
    expect(months[months.length - 1]).toMatchObject({ year: 2028, month: 5 });
  });

  it('rolling grid spans exactly 2 fiscal years when at the start of a fiscal year', () => {
    const april2026 = new Date(2026, 3, 1);
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', april2026);
    expect(months.length).toBe(24);
    expect(months[0]).toMatchObject({ year: 2026, month: 4 });
    expect(months[months.length - 1]).toMatchObject({ year: 2028, month: 3 });
  });

  it('chunks the rolling grid into fiscal years with a partial third year', () => {
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    const chunks = getFiscalYearChunks(months);
    expect(chunks.length).toBe(3);
    expect(chunks.map((c) => c.label)).toEqual(['FY26/27', 'FY27/28', 'FY28/29']);
    expect(chunks[0].months.length).toBe(12);
    expect(chunks[1].months.length).toBe(12);
    expect(chunks[2].months.length).toBe(2);
    expect(isPartialFiscalYearChunk(chunks[0])).toBe(false);
    expect(isPartialFiscalYearChunk(chunks[2])).toBe(true);
  });

  it('merges existing values onto the rolling fiscal horizon', () => {
    const existing: MonthlyValue[] = [
      { year: 2026, month: 6, amount: 5000, currency: 'CAD' },
      { year: 2026, month: 7, amount: 5500, currency: 'CAD' },
    ];
    const merged = mergeMonthlyValuesOntoFiscalHorizon(existing, 'CAD', june2026);
    expect(merged.length).toBe(26);
    expect(merged.find((m) => m.year === 2026 && m.month === 6)?.amount).toBe(5000);
    expect(merged.find((m) => m.year === 2026 && m.month === 5)?.amount).toBe(0);
    expect(merged[merged.length - 1]).toMatchObject({ year: 2028, month: 5, amount: 0 });
  });
});

const baseValues: MonthlyValue[] = [
  { year: 2026, month: 1, amount: 1000, currency: 'CAD' },
  { year: 2026, month: 2, amount: 1000, currency: 'CAD' },
  { year: 2026, month: 3, amount: 1000, currency: 'CAD' },
  { year: 2026, month: 4, amount: 1000, currency: 'CAD' },
];

describe('copyAmountAcrossEditableMonths', () => {
  it('copies source amount to editable months only', () => {
    const statuses: ForecastCellStatus[] = ['confirmed', 'suggested', 'needsReview', 'confirmed'];

    const result = copyAmountAcrossEditableMonths(baseValues, statuses, 0);

    expect(result.map((v) => v.amount)).toEqual([1000, 1000, 1000, 1000]);
  });
});

describe('applyAmountToFutureMonths', () => {
  it('copies amount to later editable cells only', () => {
    const statuses: ForecastCellStatus[] = ['confirmed', 'suggested', 'suggested', 'needsReview'];

    const result = applyAmountToFutureMonths(baseValues, statuses, 1, 2500);

    expect(result.map((v) => v.amount)).toEqual([1000, 1000, 2500, 2500]);
  });
});

describe('getCellStatuses', () => {
  const june2026 = new Date(2026, 5, 15);

  it('locks past months and requires review for the full current/future horizon', () => {
    const values = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const statuses = getCellStatuses(values, {
      quarterlyReview: { poSignedOff: false, status: 'IN_PROGRESS' },
      activeBaseline: null,
      confirmedKeys: new Set(),
      editable: true,
      now: june2026,
    });

    const aprilIndex = values.findIndex((v) => v.month === 4 && v.year === 2026);
    const mayIndex = values.findIndex((v) => v.month === 5 && v.year === 2026);
    const juneIndex = values.findIndex((v) => v.month === 6 && v.year === 2026);
    const julyIndex = values.findIndex((v) => v.month === 7 && v.year === 2026);
    const nextFyIndex = values.findIndex((v) => v.month === 4 && v.year === 2027);

    expect(statuses[aprilIndex]).toBe('past');
    expect(statuses[mayIndex]).toBe('past');
    expect(statuses[juneIndex]).toBe('needsReview');
    expect(statuses[julyIndex]).toBe('needsReview');
    expect(statuses[nextFyIndex]).toBe('needsReview');
  });

  it('stops highlighting the full horizon once the forecast review is saved', () => {
    const values = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const statuses = getCellStatuses(values, {
      quarterlyReview: { poSignedOff: false, forecastMonthsReviewed: true, status: 'IN_PROGRESS' },
      activeBaseline: null,
      confirmedKeys: new Set(),
      editable: true,
      now: june2026,
    });

    const juneIndex = values.findIndex((v) => v.month === 6 && v.year === 2026);
    const julyIndex = values.findIndex((v) => v.month === 7 && v.year === 2026);
    const nextFyIndex = values.findIndex((v) => v.month === 4 && v.year === 2027);

    expect(statuses[juneIndex]).toBe('suggested');
    expect(statuses[julyIndex]).toBe('suggested');
    expect(statuses[nextFyIndex]).toBe('suggested');
  });

  it('shows past and needs-review states in read-only view before edit is selected', () => {
    const values = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const statuses = getCellStatuses(values, {
      quarterlyReview: { poSignedOff: false, status: 'IN_PROGRESS' },
      activeBaseline: null,
      confirmedKeys: new Set(),
      editable: false,
      now: june2026,
    });

    const aprilIndex = values.findIndex((v) => v.month === 4 && v.year === 2026);
    const juneIndex = values.findIndex((v) => v.month === 6 && v.year === 2026);
    const julyIndex = values.findIndex((v) => v.month === 7 && v.year === 2026);

    expect(statuses[aprilIndex]).toBe('past');
    expect(statuses[juneIndex]).toBe('needsReview');
    expect(statuses[julyIndex]).toBe('needsReview');
  });
});

describe('preserveLockedPastMonthlyValues', () => {
  const june2026 = new Date(2026, 5, 15);

  it('reverts changes to past months from baseline', () => {
    const baseline = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const proposed = baseline.map((v) => ({ ...v, amount: 9999 }));

    const result = preserveLockedPastMonthlyValues(baseline, proposed, june2026);

    const april = result.find((v) => v.month === 4 && v.year === 2026);
    const july = result.find((v) => v.month === 7 && v.year === 2026);

    expect(april?.amount).toBe(1000);
    expect(july?.amount).toBe(9999);
  });
});

describe('getForecastIncreases', () => {
  const june2026 = new Date(2026, 5, 15);

  it('returns future-month increases over baseline', () => {
    const baseline = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const proposed = baseline.map((v) => ({
      ...v,
      amount: v.amount + (v.year === 2026 && v.month === 7 ? 500 : 0),
    }));

    const increases = getForecastIncreases(proposed, baseline, june2026);

    expect(increases).toEqual([{ year: 2026, month: 7, previousAmount: 1000, newAmount: 1500 }]);
  });
});

describe('isForecastHorizonComplete', () => {
  const june2026 = new Date(2026, 5, 15);

  it('requires non-zero amounts for every month in the rolling window', () => {
    const values = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    expect(isForecastHorizonComplete(values, FISCAL_FORECAST_HORIZON_MONTHS, june2026)).toBe(true);

    const julyIndex = values.findIndex((v) => v.month === 7 && v.year === 2026);
    values[julyIndex].amount = 0;
    expect(isForecastHorizonComplete(values, FISCAL_FORECAST_HORIZON_MONTHS, june2026)).toBe(false);
  });

  it('is incomplete when the forecast does not extend to the end of the rolling window', () => {
    // Two full fiscal years from April cover only 22 rolling months as of June.
    const values = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    expect(isForecastHorizonComplete(values, FISCAL_FORECAST_HORIZON_MONTHS, june2026)).toBe(false);
  });

  it('ignores empty past months', () => {
    const values = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    const aprilIndex = values.findIndex((v) => v.month === 4 && v.year === 2026);
    values[aprilIndex].amount = 0;
    expect(isForecastHorizonComplete(values, FISCAL_FORECAST_HORIZON_MONTHS, june2026)).toBe(true);
  });
});

describe('display helpers', () => {
  it('maps provider to spend label', () => {
    expect(getProviderSpendLabel('AZURE')).toBe('Azure Spend');
    expect(getProviderSpendLabel('AWS')).toBe('AWS Spend');
    expect(getProviderSpendLabel(undefined)).toBe('Cloud Spend');
  });
});
