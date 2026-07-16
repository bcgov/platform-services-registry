'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  buildRollingFiscalForecastMonths,
  getProviderBudgetCurrency,
  sumEnabledEnvironmentBudgets,
} from './forecast-grid-utils';
import { useForecastBudgetCad } from './useForecastBudgetCad';

/** Reads in-form budget + enabled environments for spend forecast fill/draft seeding. */
export function useFormForecastBudget(provider?: string) {
  const { watch } = useFormContext();

  const budgetDev = watch('budget.dev');
  const budgetTest = watch('budget.test');
  const budgetProd = watch('budget.prod');
  const budgetTools = watch('budget.tools');
  const envDev = watch('environmentsEnabled.development');
  const envTest = watch('environmentsEnabled.test');
  const envProd = watch('environmentsEnabled.production');
  const envTools = watch('environmentsEnabled.tools');

  const budget = useMemo(
    () => ({
      dev: Number(budgetDev) || 0,
      test: Number(budgetTest) || 0,
      prod: Number(budgetProd) || 0,
      tools: Number(budgetTools) || 0,
    }),
    [budgetDev, budgetTest, budgetProd, budgetTools],
  );

  const environmentsEnabled = useMemo(
    () => ({
      development: Boolean(envDev),
      test: Boolean(envTest),
      production: Boolean(envProd),
      tools: Boolean(envTools),
    }),
    [envDev, envTest, envProd, envTools],
  );

  const budgetCurrency = getProviderBudgetCurrency(provider);
  const budgetMonthlyTotal = useMemo(
    () => sumEnabledEnvironmentBudgets(budget, environmentsEnabled),
    [budget, environmentsEnabled],
  );
  const { budgetMonthlyTotalCad } = useForecastBudgetCad(budgetMonthlyTotal, budgetCurrency);

  const draftMonthlyValues = useMemo(
    () => buildRollingFiscalForecastMonths(budgetMonthlyTotalCad ?? 0, 'CAD', new Date()),
    [budgetMonthlyTotalCad],
  );

  return {
    budgetMonthlyTotal,
    budgetCurrency,
    draftMonthlyValues,
  };
}
