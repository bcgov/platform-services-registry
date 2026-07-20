'use client';

import { Button, NumberInput } from '@mantine/core';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { failure, success } from '@/components/notification';
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
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
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
  // Empty string = not entered (stored as 0). Keeps the input blank instead of "$0".
  const [draftValue, setDraftValue] = useState<number | ''>(value > 0 ? Math.round(value) : '');
  const [focused, setFocused] = useState(false);
  const [showApplyFuture, setShowApplyFuture] = useState(false);
  /** Amount when the cell gained focus — used so the apply link tracks the edit, not each keystroke vs parent. */
  const [amountAtFocus, setAmountAtFocus] = useState(() => Math.round(value));

  useEffect(() => {
    if (focused) return;
    setDraftValue(value > 0 ? Math.round(value) : '');
    setShowApplyFuture(false);
  }, [value, focused]);

  if (status === 'past') {
    return (
      <div className="flex flex-col items-center justify-center min-h-9">
        <span className="font-medium text-sm text-gray-400">
          {value > 0 ? formatForecastAmount(value, currency) : '—'}
        </span>
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
            setAmountAtFocus(Math.round(value));
          }}
          onBlur={() => setFocused(false)}
          onChange={(val) => {
            if (val === '' || val === undefined || val === null) {
              setDraftValue('');
              onChange(0);
              setShowApplyFuture(amountAtFocus !== 0);
              return;
            }
            const next = typeof val === 'number' ? Math.round(val) : 0;
            setDraftValue(next);
            onChange(next);
            setShowApplyFuture(next !== amountAtFocus);
          }}
          classNames={{ input: 'text-center font-medium text-sm h-9' }}
          size="sm"
        />
        {showApplyFuture && onApplyToFuture && (
          <button
            type="button"
            className="text-[10px] text-blue-700 underline"
            // Prevent input blur (which unmounts this control) before the click can apply.
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              onApplyToFuture();
              setShowApplyFuture(false);
            }}
          >
            {status === 'optional' ? 'Apply to future optional months' : 'Apply to required future months'}
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
  /** Null when editing an unsaved draft. */
  forecast: ForecastMeta | null;
  monthlyValues: MonthlyValue[];
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
  editable,
  provider,
  workflowActions,
  onValuesChange,
  onSaved,
}: ProjectBudgetForecastPanelProps) {
  const currency = 'CAD';
  const spendLabel = getProviderSpendLabel(provider);
  const isAwsBudgetUsd = getProviderBudgetCurrency(provider) === 'USD';
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
  const requiredMonths = useMemo(() => getRequiredHorizonMonths(values), [values]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleApplyToFutureMonths = (index: number, amount: number) => {
    setValues((prev) => {
      const statuses = getCellStatuses(prev, cellStatusOptions);
      return applyAmountToFutureMonths(prev, statuses, index, amount);
    });
  };

  const handleDiscardChanges = () => {
    setValues(baselineValues);
  };

  const handleSaveForecast = async () => {
    if (!licencePlate || isSaving) return;

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

    setIsSaving(true);
    try {
      if (!forecast) {
        await createPublicCloudForecast(licencePlate, payload);
      } else {
        await updatePublicCloudForecast(licencePlate, forecast.id, payload);
      }
      success();
      onSaved?.();
    } catch (error) {
      failure({ error: error as Error });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          All forecast amounts are in <span className="font-medium text-gray-800">Canadian dollars (CAD)</span>.
          {isAwsBudgetUsd && (
            <>
              {' '}
              AWS charges in USD; please keep your forecasts in CAD to stay consistent with BC Gov budgeting practices.
            </>
          )}{' '}
          Fiscal years run April–March.
        </p>
        <p>
          Past months are locked. The next {FISCAL_FORECAST_HORIZON_MONTHS} months ({yearRangeLabel(requiredMonths)})
          are required; months after that are optional.
        </p>
        {isUnsavedDraft && editable && (
          <p className="text-amber-800">
            {isFormBound ? (
              <>Draft forecast — included when you submit this create request.</>
            ) : (
              <>
                Draft forecast — nothing is saved until you click <span className="font-medium">Save forecast</span>.
              </>
            )}
          </p>
        )}
      </div>

      {workflowActions && (
        <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-200">
          {workflowActions}
        </div>
      )}

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
                loading={isSaving}
                disabled={!canSave || isSaving}
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
