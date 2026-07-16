'use client';

import { Button, NumberInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { createPublicCloudForecast, updatePublicCloudForecast } from '@/services/backend/public-cloud/forecast';
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
  horizonMonths: number;
  updatedAt?: string;
};

type CellEditorProps = Readonly<{
  value: number;
  currency: string;
  status: ForecastCellStatus;
  editable: boolean;
  onChange: (amount: number) => void;
  onApplyToFuture?: () => void;
}>;

function CellEditor({ value, currency, status, editable, onChange, onApplyToFuture }: CellEditorProps) {
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

type ProjectBudgetForecastPanelProps = Readonly<{
  /** Required when saving via API; omit for create-request form mode. */
  licencePlate?: string;
  /** Null when editing an unsaved draft seeded from product budget. */
  forecast: ForecastMeta | null;
  monthlyValues: MonthlyValue[];
  /** Sum of enabled environment budgets (dev/test/prod/tools). Used to fill months. */
  budgetMonthlyTotal?: number;
  editable: boolean;
  provider?: string;
  workflowActions?: ReactNode;
  /** When set, values sync into the parent form instead of calling the forecast APIs. */
  onValuesChange?: (values: MonthlyValue[]) => void;
  onSaved?: () => void;
}>;

export default function ProjectBudgetForecastPanel({
  licencePlate,
  forecast,
  monthlyValues,
  budgetMonthlyTotal,
  editable,
  provider,
  workflowActions,
  onValuesChange,
  onSaved,
}: ProjectBudgetForecastPanelProps) {
  const currency = 'CAD';
  const spendLabel = getProviderSpendLabel(provider);
  const isFormBound = typeof onValuesChange === 'function';
  const isUnsavedDraft = !forecast;

  const cadMonthlyValues = useMemo(
    () =>
      monthlyValues.map((value) => ({
        ...value,
        amount: Math.round(value.amount),
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

  useEffect(() => {
    if (!isFormBound) return;
    onValuesChange?.(
      values.map((value) => ({
        year: value.year,
        month: value.month,
        amount: Number(value.amount),
        currency: 'CAD' as const,
      })),
    );
  }, [isFormBound, values, onValuesChange]);

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
  const canSave = isUnsavedDraft || isDirty;
  const fiscalYearChunks = getFiscalYearChunks(values);
  const grandTotal = sumMonthlyValues(values);

  const saveForecast = useMutation({
    mutationFn: () => {
      if (!licencePlate) {
        throw new Error('licencePlate is required to save a forecast');
      }

      const lockedValues = preserveLockedPastMonthlyValues(baselineValues, values).map((v) => ({
        year: v.year,
        month: v.month,
        amount: Number(v.amount),
        currency: 'CAD' as const,
      }));
      const payload = {
        monthlyValues: lockedValues,
        horizonMonths: FISCAL_FORECAST_HORIZON_MONTHS,
      };

      if (!forecast) {
        return createPublicCloudForecast(licencePlate, payload);
      }

      return updatePublicCloudForecast(licencePlate, forecast.id, payload);
    },
    onSuccess: () => onSaved?.(),
  });

  const handleAmountChange = (index: number, amount: number) => {
    const cell = values[index];
    if (!cell || isPastMonth(cell.year, cell.month)) return;
    const rounded = Math.round(amount);
    setValues((prev) => prev.map((v, i) => (i === index ? { ...v, amount: rounded } : v)));
  };

  const cellStatusOptions = useMemo(
    () => ({ quarterlyReview: null, activeBaseline: null, confirmedKeys: new Set<string>(), editable }),
    [editable],
  );

  const handleCopyAcrossSuggested = () => {
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      const windowStart = getReviewWindowStartIndex(prev);
      const sourceIndex = windowStart > 0 ? windowStart - 1 : 0;
      return copyAmountAcrossEditableMonths(prev, statuses, sourceIndex);
    });
  };

  const handleApplyToFutureMonths = (index: number, amount: number) => {
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      return applyAmountToFutureMonths(prev, statuses, index, amount);
    });
  };

  const handleFillFromBudget = () => {
    if (budgetMonthlyTotal == null) return;
    const amount = Math.round(budgetMonthlyTotal);
    setValues((prev) =>
      prev.map((value) => (isPastMonth(value.year, value.month) ? value : { ...value, amount, currency })),
    );
  };

  const handleDiscardChanges = () => setValues(baselineValues);
  const handleSaveForecast = () => saveForecast.mutate();

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
        {budgetMonthlyTotal != null && (
          <p>
            Product budget total (enabled environments):{' '}
            <span className="font-medium text-gray-800">{formatForecastAmount(budgetMonthlyTotal, currency)}</span> per
            month.
          </p>
        )}
        {isUnsavedDraft && editable && (
          <p className="text-amber-800">
            {isFormBound ? (
              <>Draft from product budget — included when you submit this create request.</>
            ) : (
              <>
                Draft from product budget — nothing is saved until you click{' '}
                <span className="font-medium">Save forecast</span>.
              </>
            )}
          </p>
        )}
      </div>

      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-200 space-y-2">
        {workflowActions}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {editable ? (
              <>
                <Button
                  type="button"
                  size="compact-sm"
                  variant="default"
                  disabled={budgetMonthlyTotal == null}
                  onClick={handleFillFromBudget}
                >
                  Fill months from budget
                </Button>
                <Button type="button" size="compact-sm" variant="default" onClick={handleCopyAcrossSuggested}>
                  Copy value across range
                </Button>
                <Button
                  type="button"
                  size="compact-sm"
                  variant="default"
                  disabled={!isDirty}
                  onClick={handleDiscardChanges}
                >
                  Discard changes
                </Button>
                {!isFormBound && (
                  <Button
                    type="button"
                    size="compact-sm"
                    color="primary"
                    loading={saveForecast.isPending}
                    disabled={!canSave}
                    onClick={handleSaveForecast}
                  >
                    Save forecast
                  </Button>
                )}
              </>
            ) : (
              <span className="text-gray-500 font-medium">Forecast</span>
            )}
          </div>
          {editable && forecast?.updatedAt && (
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
                          {shortMonthLabel(v.year, v.month)}
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
                              onChange={(amount) => handleAmountChange(globalIndex, amount)}
                              onApplyToFuture={() =>
                                handleApplyToFutureMonths(globalIndex, values[globalIndex]?.amount ?? 0)
                              }
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                        {formatForecastAmount(yearTotal, currency)}
                      </td>
                    </tr>
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
          let yearHint = 'First fiscal year in forecast';
          if (isPartial) {
            yearHint = `First ${fyChunk.months.length} month${
              fyChunk.months.length === 1 ? '' : 's'
            } of the fiscal year`;
          } else if (inProgress) {
            yearHint = 'Full-year forecast total (year still in progress)';
          }

          return (
            <div key={fyChunk.label} className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fyChunk.label} total</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{formatForecastAmount(yearTotal, currency)}</div>
              <div className="text-sm text-gray-500 mt-1">{yearHint}</div>
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
