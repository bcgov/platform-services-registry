'use client';

import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  buildRollingFiscalForecastMonths,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';

export default function PublicCloudCreateForecastSection() {
  const { watch, setValue, getValues, formState } = useFormContext();
  const provider = watch('provider');
  const forecastError = formState.errors.forecastMonthlyValues;
  const forecastErrorMessage =
    forecastError && 'message' in forecastError && typeof forecastError.message === 'string'
      ? forecastError.message
      : undefined;
  const initialMonthlyValues = useMemo(() => {
    const existing = getValues('forecastMonthlyValues') as MonthlyValue[] | undefined;
    return existing?.length ? existing : buildRollingFiscalForecastMonths(0, 'CAD', new Date());
  }, [getValues]);

  const handleValuesChange = useCallback(
    (values: MonthlyValue[]) => {
      setValue('forecastMonthlyValues', values, {
        shouldDirty: true,
        shouldValidate: formState.submitCount > 0,
      });
    },
    [formState.submitCount, setValue],
  );

  return (
    <div className="space-y-3">
      {forecastErrorMessage && <p className="text-sm text-red-600">{forecastErrorMessage}</p>}
      <ProjectBudgetForecastPanel
        forecast={null}
        monthlyValues={initialMonthlyValues}
        editable
        provider={provider}
        highlightIncompleteRequired={Boolean(forecastErrorMessage)}
        onValuesChange={handleValuesChange}
      />
    </div>
  );
}
