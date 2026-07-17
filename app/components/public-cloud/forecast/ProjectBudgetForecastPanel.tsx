'use client';

import { Button, NumberInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { createPublicCloudForecast, updatePublicCloudForecast } from '@/services/backend/public-cloud/forecast';
import {
  applyAmountToFutureMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  fiscalYearChunkHasOptionalMonths,
  formatForecastAmount,
  getCellStatuses,
  getFiscalYearChunks,
  getFiscalYearTotalSummary,
  getProviderBudgetCurrency,
  getProviderSpendLabel,
  getRequiredHorizonMonths,
  isPastMonth,
  isRequiredForecastMonth,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
  sumRequiredHorizonMonths,
  yearRangeLabel,
  type BudgetCurrency,
  type ForecastCellStatus,
  type MonthlyValue,
} from './forecast-grid-utils';
import { useForecastBudgetCad } from './useForecastBudgetCad';

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
  onFocusCell?: () => void;
  onApplyToFuture?: () => void;
}>;

function CellEditor({ value, currency, status, editable, onChange, onFocusCell, onApplyToFuture }: CellEditorProps) {
  // Empty string = not entered (stored as 0). Keeps the input blank instead of "$0".
  const [draftValue, setDraftValue] = useState<number | ''>(value > 0 ? Math.round(value) : '');
  const [focused, setFocused] = useState(false);
  const [showApplyFuture, setShowApplyFuture] = useState(false);

  useEffect(() => {
    if (focused) return;
    setDraftValue(value > 0 ? Math.round(value) : '');
    setShowApplyFuture(false);
  }, [value, focused]);

  if (status === 'past') {
    return (
      <div className="flex flex-col items-center justify-center min-h-9">
        <span className="font-medium text-sm text-gray-400">—</span>
      </div>
    );
  }

  if (editable) {
    return (
      <div className="space-y-1">
        <NumberInput
          value={draftValue}
          min={0}
          hideControls
          decimalScale={0}
          allowDecimal={false}
          thousandSeparator=","
          prefix={draftValue === '' ? undefined : '$'}
          allowNegative={false}
          onFocus={() => {
            setFocused(true);
            onFocusCell?.();
          }}
          onBlur={() => setFocused(false)}
          onChange={(val) => {
            if (val === '' || val === undefined || val === null) {
              setDraftValue('');
              onChange(0);
              setShowApplyFuture(Math.round(value) !== 0);
              return;
            }
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
            Apply to required future months
          </button>
        )}
      </div>
    );
  }

  if (value <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-9">
        <span className="font-medium text-sm text-gray-400">—</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-9">
      <span className={`font-medium text-sm ${status === 'optional' ? 'text-gray-500' : 'text-gray-900'}`}>
        {formatForecastAmount(value, currency)}
      </span>
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
  /** Currency of `budgetMonthlyTotal` (USD for AWS, CAD for Azure). Defaults from provider. */
  budgetCurrency?: BudgetCurrency;
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
  budgetCurrency: budgetCurrencyProp,
  editable,
  provider,
  workflowActions,
  onValuesChange,
  onSaved,
}: ProjectBudgetForecastPanelProps) {
  const currency = 'CAD';
  const spendLabel = getProviderSpendLabel(provider);
  const budgetCurrency = budgetCurrencyProp ?? getProviderBudgetCurrency(provider);
  const { budgetMonthlyTotalCad, exchangeRate, isRateLoading, isRateError, refetchRate } = useForecastBudgetCad(
    budgetMonthlyTotal,
    budgetCurrency,
  );
  const isFormBound = typeof onValuesChange === 'function';
  const isUnsavedDraft = !forecast;
  const canFillFromBudget = budgetMonthlyTotalCad != null && !isRateLoading && !isRateError;

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
  /** Index of the month last focused or edited — source for "Copy across required months". */
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setValues(baselineValues);
    setLastActiveIndex(null);
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
  const canCopyAcrossRange = lastActiveIndex != null;
  const fiscalYearChunks = getFiscalYearChunks(values);
  const requiredMonths = useMemo(() => getRequiredHorizonMonths(values), [values]);
  const requiredTotal = useMemo(() => sumRequiredHorizonMonths(values), [values]);
  const hasOptionalMonths = fiscalYearChunks.some((chunk) => fiscalYearChunkHasOptionalMonths(chunk));

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
    setLastActiveIndex(index);
    setValues((prev) => prev.map((v, i) => (i === index ? { ...v, amount: rounded } : v)));
  };

  const cellStatusOptions = useMemo(
    () => ({ quarterlyReview: null, activeBaseline: null, confirmedKeys: new Set<string>(), editable }),
    [editable],
  );

  const handleCopyAcrossRange = () => {
    if (lastActiveIndex == null) return;
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      const amount = prev[lastActiveIndex]?.amount ?? 0;
      return applyAmountToFutureMonths(prev, statuses, lastActiveIndex, amount);
    });
  };

  const handleApplyToFutureMonths = (index: number, amount: number) => {
    setLastActiveIndex(index);
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      return applyAmountToFutureMonths(prev, statuses, index, amount);
    });
  };

  const handleFillFromBudget = () => {
    if (budgetMonthlyTotalCad == null) return;
    const amount = budgetMonthlyTotalCad;
    setValues((prev) =>
      prev.map((value) => (isRequiredForecastMonth(value.year, value.month) ? { ...value, amount, currency } : value)),
    );
  };

  const handleDiscardChanges = () => {
    setValues(baselineValues);
    setLastActiveIndex(null);
  };
  const handleSaveForecast = () => saveForecast.mutate();

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          All forecast amounts are in <span className="font-medium text-gray-800">Canadian dollars</span>. Fiscal years
          run April–March.
        </p>
        <p>
          Required rolling {FISCAL_FORECAST_HORIZON_MONTHS}-month forecast ({yearRangeLabel(requiredMonths)}). Past
          months are locked and left blank. Months beyond that window are optional and can be filled for a full fiscal
          year view.
        </p>
        {budgetMonthlyTotal != null && (
          <p>
            Product budget total (enabled environments):{' '}
            <span className="font-medium text-gray-800">
              {formatForecastAmount(budgetMonthlyTotal, budgetCurrency)}
            </span>{' '}
            per month.
            {budgetCurrency === 'USD' && (
              <>
                {isRateLoading && <span className="text-gray-500"> Loading USD→CAD rate…</span>}
                {isRateError && (
                  <span className="text-red-700">
                    {' '}
                    Could not load exchange rate.{' '}
                    <button type="button" className="underline" onClick={() => refetchRate()}>
                      Retry
                    </button>
                  </span>
                )}
                {budgetMonthlyTotalCad != null && exchangeRate && (
                  <span className="text-gray-700">
                    {' '}
                    ≈{' '}
                    <span className="font-medium text-gray-800">
                      {formatForecastAmount(budgetMonthlyTotalCad, 'CAD')}
                    </span>{' '}
                    for forecast fill (BoC rate {exchangeRate.rate.toFixed(4)} as of {exchangeRate.date}).
                  </span>
                )}
              </>
            )}
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
        {hasOptionalMonths && editable && (
          <p className="text-gray-600">
            Months labeled optional are beyond the required window — only the {FISCAL_FORECAST_HORIZON_MONTHS}-month
            forecast is required.
          </p>
        )}
      </div>

      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-200 space-y-2">
        {workflowActions}
        <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm text-sm">
          {editable ? (
            <>
              <Button
                type="button"
                size="compact-sm"
                variant="default"
                disabled={!canFillFromBudget}
                onClick={handleFillFromBudget}
              >
                Fill months from budget
              </Button>
              <Button
                type="button"
                size="compact-sm"
                variant="default"
                disabled={!canCopyAcrossRange}
                onClick={handleCopyAcrossRange}
              >
                Copy across required months
              </Button>
            </>
          ) : (
            <span className="text-gray-500 font-medium">Forecast</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {fiscalYearChunks.map((fyChunk) => {
          const fySummary = getFiscalYearTotalSummary(fyChunk);
          const hasOptional = fiscalYearChunkHasOptionalMonths(fyChunk);

          return (
            <div key={fyChunk.label} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                {fyChunk.label} <span className="font-normal text-gray-500">({yearRangeLabel(fyChunk.months)})</span>
                {hasOptional && (
                  <span className="ml-2 font-normal text-xs text-gray-500">
                    months beyond the required {FISCAL_FORECAST_HORIZON_MONTHS}-month window are optional
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-gray-500 w-28 sticky left-0 bg-white">{spendLabel}</th>
                      {fyChunk.months.map((v, i) => {
                        const optional = cellStatuses[fyChunk.startIndex + i] === 'optional';
                        return (
                          <th
                            key={monthKey(v.year, v.month)}
                            className={`px-2 py-2 text-center font-medium ${
                              optional ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {shortMonthLabel(v.year, v.month)}
                            {optional && <div className="text-[10px] font-normal normal-case">optional</div>}
                          </th>
                        );
                      })}
                      <th className="px-3 py-2 text-center font-semibold bg-amber-50 text-gray-800 w-28">
                        TOTAL
                        {fySummary.isPartial && (
                          <div className="text-[10px] font-normal normal-case text-gray-500">partial</div>
                        )}
                      </th>
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
                              onFocusCell={() => setLastActiveIndex(globalIndex)}
                              onApplyToFuture={() =>
                                handleApplyToFutureMonths(globalIndex, values[globalIndex]?.amount ?? 0)
                              }
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                        {formatForecastAmount(fySummary.total, currency)}
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
          const fySummary = getFiscalYearTotalSummary(fyChunk);

          return (
            <div
              key={fyChunk.label}
              className={`rounded-lg border p-4 bg-white ${
                fySummary.isPartial ? 'border-amber-200' : 'border-gray-200'
              }`}
            >
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fySummary.title}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatForecastAmount(fySummary.total, currency)}
              </div>
              <div className="text-sm text-gray-500 mt-1">{fySummary.hint}</div>
            </div>
          );
        })}
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {FISCAL_FORECAST_HORIZON_MONTHS}-month forecast total
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatForecastAmount(requiredTotal, currency)}</div>
          <div className="text-xs text-gray-600 mt-1">{yearRangeLabel(requiredMonths)}</div>
        </div>
      </div>

      {editable && (
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" size="sm" variant="default" disabled={!isDirty} onClick={handleDiscardChanges}>
              Discard changes
            </Button>
            {!isFormBound && (
              <Button
                type="button"
                size="sm"
                color="primary"
                loading={saveForecast.isPending}
                disabled={!canSave}
                onClick={handleSaveForecast}
              >
                Save forecast
              </Button>
            )}
          </div>
          {forecast?.updatedAt && (
            <div className="text-xs text-gray-600">Last saved {new Date(forecast.updatedAt).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  );
}
