'use client';

import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { MonthlyValue } from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { useFormForecastBudget } from '@/components/public-cloud/forecast/useFormForecastBudget';

export default function PublicCloudCreateForecastSection() {
  const { watch, setValue } = useFormContext();
  const provider = watch('provider');
  const { budgetMonthlyTotal, budgetCurrency, draftMonthlyValues } = useFormForecastBudget(provider);

  const handleValuesChange = useCallback(
    (values: MonthlyValue[]) => {
      setValue('forecastMonthlyValues', values, { shouldDirty: true, shouldValidate: false });
    },
    [setValue],
  );

  return (
    <ProjectBudgetForecastPanel
      forecast={null}
      monthlyValues={draftMonthlyValues}
      budgetMonthlyTotal={budgetMonthlyTotal}
      budgetCurrency={budgetCurrency}
      editable
      provider={provider}
      onValuesChange={handleValuesChange}
    />
  );
}
