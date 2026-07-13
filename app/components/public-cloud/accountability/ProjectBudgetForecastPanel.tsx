'use client';

import { Button, NumberInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { convertUsdToCad, formatUsdCadRate, getUsdToCadRate, providerReportsActualsInUsd } from '@/helpers/usd-cad-fx';
import { updatePublicCloudForecast } from '@/services/backend/public-cloud/accountability';
import {
  applyAmountToFutureMonths,
  copyAmountAcrossEditableMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  formatForecastAmount,
  getCellStatuses,
  getFiscalYearChunks,
  getProviderSpendLabel,
  getReviewWindowStartIndex,
  isInProgressFiscalYear,
  isPartialFiscalYearChunk,
  isPastMonth,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
  sumMonthlyValues,
  yearRangeLabel,
  type ForecastCellStatus,
  type MonthlyValue,
} from './forecast-grid-utils';

type ForecastMeta = {
  id: string;
  version: number;
  status: string;
  horizonMonths: number;
  updatedAt?: string;
};

type MonthlyActual = {
  year: number;
  month: number;
  amount: number;
};

function CellEditor({
  value,
  currency,
  status,
  editable,
  onChange,
  onApplyToFuture,
}: {
  value: number;
  currency: string;
  status: ForecastCellStatus;
  editable: boolean;
  onChange: (amount: number) => void;
  onApplyToFuture?: () => void;
}) {
  const [draftValue, setDraftValue] = useState(value);
  const [showApplyFuture, setShowApplyFuture] = useState(false);

  useEffect(() => {
    setDraftValue(Math.round(value));
    setShowApplyFuture(false);
  }, [value]);

  if (status === 'past') {
    return (
      <div className="flex flex-col items-center justify-center min-h-9">
        <span className="font-medium text-sm text-gray-400">{formatForecastAmount(value, currency)}</span>
      </div>
    );
  }

  if (editable) {
    return (
      <div className="space-y-1">
        <NumberInput
          value={Math.round(draftValue)}
          min={0}
          hideControls
          decimalScale={0}
          allowDecimal={false}
          thousandSeparator=","
          prefix="$"
          onChange={(val) => {
            const next = typeof val === 'number' ? Math.round(val) : 0;
            setDraftValue(next);
            onChange(next);
            setShowApplyFuture(next !== Math.round(value));
          }}
          classNames={{ input: 'text-center font-medium text-sm h-9' }}
          size="sm"
        />
        {showApplyFuture && onApplyToFuture && (
          <button
            type="button"
            className="text-[10px] text-blue-700 underline"
            onClick={() => {
              onApplyToFuture();
              setShowApplyFuture(false);
            }}
          >
            Apply to all future months
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-9">
      <span className="font-medium text-sm text-gray-900">{formatForecastAmount(value, currency)}</span>
    </div>
  );
}

export default function ProjectBudgetForecastPanel({
  licencePlate,
  forecast,
  monthlyValues,
  monthlyActuals = [],
  editable,
  provider,
  workflowActions,
  onSaved,
}: {
  licencePlate: string;
  forecast: ForecastMeta;
  monthlyValues: MonthlyValue[];
  monthlyActuals?: MonthlyActual[];
  activeBaseline?: MonthlyValue[] | null;
  quarterlyReview?: unknown;
  editable: boolean;
  provider?: string;
  workflowActions?: ReactNode;
  onSaved: () => void;
}) {
  const currency = 'CAD';
  const showAwsFx = providerReportsActualsInUsd(provider ?? '');
  const spendLabel = getProviderSpendLabel(provider);
  const actualsByKey = useMemo(
    () => new Map(monthlyActuals.map((v) => [monthKey(v.year, v.month), v.amount])),
    [monthlyActuals],
  );
  const hasActuals = monthlyActuals.length > 0;

  const cadMonthlyValues = useMemo(
    () =>
      monthlyValues.map((value) => ({
        ...value,
        amount:
          value.currency === 'USD' ? convertUsdToCad(value.amount, value.year, value.month) : Math.round(value.amount),
        currency: 'CAD' as const,
      })),
    [monthlyValues],
  );

  const baselineValues = useMemo(
    () => mergeMonthlyValuesOntoFiscalHorizon(cadMonthlyValues, currency),
    [cadMonthlyValues, currency],
  );

  const [values, setValues] = useState(baselineValues);

  useEffect(() => {
    setValues(baselineValues);
  }, [baselineValues]);

  const cellStatuses = useMemo(
    () =>
      getCellStatuses(values, {
        quarterlyReview: null,
        activeBaseline: null,
        confirmedKeys: new Set(),
        editable,
      }),
    [values, editable],
  );

  const isDirty = JSON.stringify(values) !== JSON.stringify(baselineValues);
  const fiscalYearChunks = getFiscalYearChunks(values);
  const grandTotal = sumMonthlyValues(values);

  const save = useMutation({
    mutationFn: () => {
      const lockedValues = preserveLockedPastMonthlyValues(baselineValues, values);
      return updatePublicCloudForecast(licencePlate, forecast.id, {
        monthlyValues: lockedValues.map((v) => ({
          year: v.year,
          month: v.month,
          amount: Number(v.amount),
          currency: 'CAD' as const,
        })),
        horizonMonths: FISCAL_FORECAST_HORIZON_MONTHS,
      });
    },
    onSuccess: () => onSaved(),
  });

  const updateAmount = (index: number, amount: number) => {
    const cell = values[index];
    if (!cell || isPastMonth(cell.year, cell.month)) return;
    const rounded = Math.round(amount);
    setValues((prev) => prev.map((v, i) => (i === index ? { ...v, amount: rounded } : v)));
  };

  const cellStatusOptions = useMemo(
    () => ({ quarterlyReview: null, activeBaseline: null, confirmedKeys: new Set<string>(), editable }),
    [editable],
  );

  const copyAcrossSuggested = () => {
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      const windowStart = getReviewWindowStartIndex(prev);
      const sourceIndex = windowStart > 0 ? windowStart - 1 : 0;
      return copyAmountAcrossEditableMonths(prev, statuses, sourceIndex);
    });
  };

  const applyToFutureMonths = (index: number, amount: number) => {
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      return applyAmountToFutureMonths(prev, statuses, index, amount);
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          All forecast amounts are in <span className="font-medium text-gray-800">Canadian dollars</span>. Fiscal years
          run April–March.
        </p>
        <p>
          Rolling {FISCAL_FORECAST_HORIZON_MONTHS}-month forecast ({yearRangeLabel(values)}). Past months are locked and
          shown for reference.
        </p>
        {showAwsFx && (
          <p>
            AWS invoices in USD. Closed-month actuals are converted to CAD using the monthly USD/CAD rate shown under
            each month.
          </p>
        )}
      </div>

      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-200 space-y-2">
        {workflowActions}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {editable ? (
              <>
                <Button type="button" size="compact-sm" variant="default" onClick={copyAcrossSuggested}>
                  Copy value across range
                </Button>
                <Button
                  type="button"
                  size="compact-sm"
                  variant="default"
                  disabled={!isDirty}
                  onClick={() => setValues(baselineValues)}
                >
                  Discard changes
                </Button>
                <Button
                  type="button"
                  size="compact-sm"
                  color="primary"
                  loading={save.isPending}
                  disabled={!isDirty}
                  onClick={() => save.mutate()}
                >
                  Save forecast
                </Button>
              </>
            ) : (
              <span className="text-gray-500 font-medium">Forecast</span>
            )}
          </div>
          {editable && forecast.updatedAt && (
            <div className="text-xs text-gray-600">Last saved {new Date(forecast.updatedAt).toLocaleString()}</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {fiscalYearChunks.map((fyChunk) => {
          const yearTotal = sumMonthlyValues(fyChunk.months);

          return (
            <div key={fyChunk.label} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                {fyChunk.label} <span className="font-normal text-gray-500">({yearRangeLabel(fyChunk.months)})</span>
                {isPartialFiscalYearChunk(fyChunk) && (
                  <span className="ml-2 font-normal text-xs text-gray-500">
                    partial year — end of the rolling {FISCAL_FORECAST_HORIZON_MONTHS}-month window
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-gray-500 w-28 sticky left-0 bg-white">{spendLabel}</th>
                      {fyChunk.months.map((v) => (
                        <th key={monthKey(v.year, v.month)} className="px-2 py-2 text-center text-gray-500 font-medium">
                          <div>{shortMonthLabel(v.year, v.month)}</div>
                          {showAwsFx &&
                            (() => {
                              const fx = getUsdToCadRate(v.year, v.month);
                              return (
                                <div
                                  className={`text-[10px] font-normal mt-0.5 ${
                                    fx.status === 'actual' ? 'text-gray-500' : 'text-amber-700'
                                  }`}
                                >
                                  FX {formatUsdCadRate(fx.rate)}
                                  {fx.status === 'tentative' ? ' tent.' : ''}
                                </div>
                              );
                            })()}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center font-semibold bg-amber-50 text-gray-800">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-gray-600 sticky left-0 bg-white border-r border-gray-100">
                        Forecast
                      </td>
                      {fyChunk.months.map((v, i) => {
                        const globalIndex = fyChunk.startIndex + i;
                        const status = cellStatuses[globalIndex];
                        const cellClass = status === 'past' ? 'bg-gray-100' : 'bg-white';

                        return (
                          <td key={monthKey(v.year, v.month)} className={`px-1 py-1 ${cellClass}`}>
                            <CellEditor
                              value={v.amount}
                              currency={currency}
                              status={status}
                              editable={editable}
                              onChange={(amount) => updateAmount(globalIndex, amount)}
                              onApplyToFuture={() => applyToFutureMonths(globalIndex, values[globalIndex]?.amount ?? 0)}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                        {formatForecastAmount(yearTotal, currency)}
                      </td>
                    </tr>
                    {hasActuals && (
                      <tr>
                        <td className="px-3 py-2 text-gray-600 sticky left-0 bg-white border-r border-gray-100">
                          Actual
                        </td>
                        {fyChunk.months.map((v) => {
                          const actual = actualsByKey.get(monthKey(v.year, v.month));
                          return (
                            <td
                              key={`actual-${monthKey(v.year, v.month)}`}
                              className="px-2 py-2 text-center text-sm text-gray-700 bg-gray-100"
                            >
                              {actual != null ? formatForecastAmount(actual, currency) : '—'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-semibold bg-amber-50 text-gray-800">
                          {formatForecastAmount(
                            fyChunk.months.reduce(
                              (sum, v) => sum + (actualsByKey.get(monthKey(v.year, v.month)) ?? 0),
                              0,
                            ),
                            currency,
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {fiscalYearChunks.map((fyChunk) => {
          const yearTotal = sumMonthlyValues(fyChunk.months);
          const isPartial = isPartialFiscalYearChunk(fyChunk);
          const inProgress = isInProgressFiscalYear(fyChunk);

          return (
            <div key={fyChunk.label} className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fyChunk.label} total</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{formatForecastAmount(yearTotal, currency)}</div>
              {isPartial ? (
                <div className="text-sm text-gray-500 mt-1">
                  First {fyChunk.months.length} month{fyChunk.months.length === 1 ? '' : 's'} of the fiscal year
                </div>
              ) : inProgress ? (
                <div className="text-sm text-gray-500 mt-1">Full-year forecast total (year still in progress)</div>
              ) : (
                <div className="text-sm text-gray-500 mt-1">First fiscal year in forecast</div>
              )}
            </div>
          );
        })}
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {FISCAL_FORECAST_HORIZON_MONTHS}-month forecast total
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatForecastAmount(grandTotal, currency)}</div>
          <div className="text-xs text-gray-600 mt-1">{yearRangeLabel(values)}</div>
        </div>
      </div>
    </div>
  );
}
