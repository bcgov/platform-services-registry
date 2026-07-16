'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsdCadExchangeRate } from '@/services/backend/exchange-rates';
import { convertCurrencyAmount } from '@/services/exchange-rates';
import type { BudgetCurrency } from './forecast-grid-utils';

export function useForecastBudgetCad(budgetMonthlyTotal: number | undefined, budgetCurrency: BudgetCurrency) {
  const needsRate = budgetCurrency === 'USD' && budgetMonthlyTotal != null && budgetMonthlyTotal !== 0;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['usd-cad-exchange-rate'],
    queryFn: getUsdCadExchangeRate,
    enabled: needsRate,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  let budgetMonthlyTotalCad: number | undefined;
  if (budgetMonthlyTotal == null) {
    budgetMonthlyTotalCad = undefined;
  } else if (budgetCurrency === 'CAD' || budgetMonthlyTotal === 0) {
    budgetMonthlyTotalCad = Math.round(budgetMonthlyTotal);
  } else if (data?.rate) {
    budgetMonthlyTotalCad = convertCurrencyAmount(budgetMonthlyTotal, 'USD', 'CAD', data.rate);
  } else {
    budgetMonthlyTotalCad = undefined;
  }

  return {
    budgetMonthlyTotalCad,
    exchangeRate: data,
    isRateLoading: needsRate && isLoading,
    isRateError: needsRate && isError,
    rateError: error,
    refetchRate: refetch,
  };
}
