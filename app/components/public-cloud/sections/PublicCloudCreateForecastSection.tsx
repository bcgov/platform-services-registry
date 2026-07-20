'use client';

import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  buildRollingFiscalForecastMonths,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';

export default function PublicCloudCreateForecastSection() {
  const { watch, setValue } = useFormContext();
  const provider = watch('provider');
  const draftMonthlyValues = useMemo(() => buildRollingFiscalForecastMonths(0, 'CAD', new Date()), []);

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
      editable
      provider={provider}
      onValuesChange={handleValuesChange}
    />
  );
}
