import {
  applyAmountToFutureMonths,
  buildFiscalForecastMonths,
  buildRollingFiscalForecastMonths,
  copyAmountAcrossEditableMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  fiscalYearChunkHasOptionalMonths,
  formatFiscalYearLabel,
  getFiscalYearChunks,
  getFiscalYearStartYear,
  getFiscalYearTotalSummary,
  getCellStatuses,
  getForecastIncreases,
  getProviderBudgetCurrency,
  getProviderSpendLabel,
  getRequiredHorizonMonths,
  isBeyondRequiredHorizon,
  isForecastHorizonComplete,
  isPartialFiscalYearChunk,
  isRequiredForecastMonth,
  mergeMonthlyValuesOntoFiscalHorizon,
  preserveLockedPastMonthlyValues,
  shortMonthRangeLabel,
  sumRequiredHorizonMonths,
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
    expect(months).toHaveLength(24);
    expect(months[0]).toMatchObject({ year: 2026, month: 4, amount: 1000 });
    expect(months[11]).toMatchObject({ year: 2027, month: 3 });
    expect(months[12]).toMatchObject({ year: 2027, month: 4 });
  });

  it('builds a rolling grid padded to fiscal year ends', () => {
    // June 2026: required Jun '26 – May '28; grid Apr '26 – Mar '29 (3 full FYs).
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    expect(months).toHaveLength(36);
    expect(months[0]).toMatchObject({ year: 2026, month: 4, amount: 0 });
    expect(months[1]).toMatchObject({ year: 2026, month: 5, amount: 0 });
    expect(months[2]).toMatchObject({ year: 2026, month: 6, amount: 1000 });
    expect(months.at(-1)).toMatchObject({ year: 2029, month: 3, amount: 0 });
    expect(months.find((m) => m.year === 2028 && m.month === 5)?.amount).toBe(1000);
    expect(months.find((m) => m.year === 2028 && m.month === 6)?.amount).toBe(0);
  });

  it('rolling grid spans exactly 2 fiscal years when at the start of a fiscal year', () => {
    const april2026 = new Date(2026, 3, 1);
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', april2026);
    expect(months).toHaveLength(24);
    expect(months[0]).toMatchObject({ year: 2026, month: 4, amount: 1000 });
    expect(months.at(-1)).toMatchObject({ year: 2028, month: 3, amount: 1000 });
  });

  it('chunks the rolling grid into full 12-month fiscal years', () => {
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    const chunks = getFiscalYearChunks(months);
    expect(chunks).toHaveLength(3);
    expect(chunks.map((c) => c.label)).toEqual(['FY26/27', 'FY27/28', 'FY28/29']);
    expect(chunks[0].months).toHaveLength(12);
    expect(chunks[1].months).toHaveLength(12);
    expect(chunks[2].months).toHaveLength(12);
    expect(isPartialFiscalYearChunk(chunks[0])).toBe(false);
    expect(isPartialFiscalYearChunk(chunks[2])).toBe(false);
    expect(fiscalYearChunkHasOptionalMonths(chunks[0], june2026)).toBe(false);
    expect(fiscalYearChunkHasOptionalMonths(chunks[2], june2026)).toBe(true);
  });

  it('does not seed past months with the budget amount', () => {
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    expect(months.filter((m) => m.year === 2026 && m.month < 6).every((m) => m.amount === 0)).toBe(true);
    expect(getRequiredHorizonMonths(months, june2026)).toHaveLength(24);
    expect(sumRequiredHorizonMonths(months, june2026)).toBe(24_000);
  });

  it('merges existing values onto the rolling fiscal horizon', () => {
    const existing: MonthlyValue[] = [
      { year: 2026, month: 5, amount: 9999, currency: 'CAD' },
      { year: 2026, month: 6, amount: 5000, currency: 'CAD' },
      { year: 2026, month: 7, amount: 5500, currency: 'CAD' },
    ];
    const merged = mergeMonthlyValuesOntoFiscalHorizon(existing, 'CAD', june2026);
    expect(merged).toHaveLength(36);
    // Existing forecasts keep stored past amounts (projects that existed earlier in the year).
    expect(merged.find((m) => m.year === 2026 && m.month === 5)?.amount).toBe(9999);
    expect(merged.find((m) => m.year === 2026 && m.month === 6)?.amount).toBe(5000);
    expect(merged.find((m) => m.year === 2026 && m.month === 7)?.amount).toBe(5500);
    expect(merged.at(-1)).toMatchObject({ year: 2029, month: 3, amount: 0 });
  });

  it('classifies months beyond the required horizon as optional', () => {
    expect(isBeyondRequiredHorizon(2028, 5, june2026)).toBe(false);
    expect(isBeyondRequiredHorizon(2028, 6, june2026)).toBe(true);
    expect(isRequiredForecastMonth(2026, 5, june2026)).toBe(false);
    expect(isRequiredForecastMonth(2026, 6, june2026)).toBe(true);
    expect(isRequiredForecastMonth(2028, 6, june2026)).toBe(false);
  });

  it('labels a stub fiscal year as partial until every optional month is filled', () => {
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    const chunks = getFiscalYearChunks(months);
    const partial = getFiscalYearTotalSummary(chunks[2], june2026);

    expect(partial.isPartial).toBe(true);
    expect(partial.title).toBe('FY28/29 partial');
    expect(partial.total).toBe(2000); // Apr–May 2028 only (required through May)
    expect(partial.hint).toBe('Apr–May only');
    expect(partial.partialRangeLabel).toBe('partial');
    expect(shortMonthRangeLabel(chunks[2].months.slice(0, 2))).toBe('Apr–May');

    // A single optional month must not flip the card to "full fiscal year".
    const oneOptional = {
      ...chunks[2],
      months: chunks[2].months.map((m) => (m.year === 2028 && m.month === 6 ? { ...m, amount: 100 } : m)),
    };
    const stillPartial = getFiscalYearTotalSummary(oneOptional, june2026);
    expect(stillPartial.isPartial).toBe(true);
    expect(stillPartial.title).toBe('FY28/29 partial');
    expect(stillPartial.total).toBe(2100);
    expect(stillPartial.hint).toBe('Apr–May required · 1 of 10 optional months entered');
    expect(stillPartial.partialRangeLabel).toBe('partial');

    const filled = {
      ...chunks[2],
      months: chunks[2].months.map((m) => ({ ...m, amount: 1000 })),
    };
    const full = getFiscalYearTotalSummary(filled, june2026);
    expect(full.isPartial).toBe(false);
    expect(full.title).toBe('FY28/29 total');
    expect(full.total).toBe(12_000);
    expect(full.hint).toBe('Full fiscal year');
  });

  it('labels an in-progress fiscal year by the remaining month range', () => {
    const months = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
    const chunks = getFiscalYearChunks(months);
    const currentFy = getFiscalYearTotalSummary(chunks[0], june2026);

    expect(currentFy.isPartial).toBe(false);
    expect(currentFy.title).toBe('FY26/27 total');
    expect(currentFy.hint).toBe('Jun–Mar forecast (year still in progress)');
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

  it('does not copy amount into optional months beyond the required horizon', () => {
    const statuses: ForecastCellStatus[] = ['suggested', 'optional', 'optional', 'past'];

    const result = applyAmountToFutureMonths(baseValues, statuses, 0, 2500);

    expect(result.map((v) => v.amount)).toEqual([1000, 1000, 1000, 1000]);
  });
});

describe('getCellStatuses', () => {
  const june2026 = new Date(2026, 5, 15);

  it('locks past months and requires review for the full current/future horizon', () => {
    const values = buildRollingFiscalForecastMonths(1000, 'CAD', june2026);
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
    const optionalIndex = values.findIndex((v) => v.month === 6 && v.year === 2028);

    expect(statuses[aprilIndex]).toBe('past');
    expect(statuses[mayIndex]).toBe('past');
    expect(statuses[juneIndex]).toBe('needsReview');
    expect(statuses[julyIndex]).toBe('needsReview');
    expect(statuses[nextFyIndex]).toBe('needsReview');
    expect(statuses[optionalIndex]).toBe('optional');
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

  it('keeps baseline past amounts when proposed tries to change them', () => {
    const baseline = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const proposed = baseline.map((v) => ({ ...v, amount: 9999 }));

    const result = preserveLockedPastMonthlyValues(baseline, proposed, june2026);

    const april = result.find((v) => v.month === 4 && v.year === 2026);
    const july = result.find((v) => v.month === 7 && v.year === 2026);

    expect(april?.amount).toBe(1000);
    expect(july?.amount).toBe(9999);
  });

  it('keeps baseline months that are omitted from a partial proposed update', () => {
    const baseline = buildFiscalForecastMonths(2, 1000, 'CAD', june2026);
    const proposed: MonthlyValue[] = [{ year: 2026, month: 7, amount: 2500, currency: 'CAD' }];

    const result = preserveLockedPastMonthlyValues(baseline, proposed, june2026);

    expect(result).toHaveLength(baseline.length);
    expect(result.find((v) => v.month === 7 && v.year === 2026)?.amount).toBe(2500);
    expect(result.find((v) => v.month === 4 && v.year === 2026)?.amount).toBe(1000);
    expect(result.find((v) => v.month === 8 && v.year === 2026)?.amount).toBe(1000);
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

  it('maps provider to budget currency', () => {
    expect(getProviderBudgetCurrency('AZURE')).toBe('CAD');
    expect(getProviderBudgetCurrency('AWS')).toBe('USD');
    expect(getProviderBudgetCurrency('AWS_LZA')).toBe('USD');
  });
});
