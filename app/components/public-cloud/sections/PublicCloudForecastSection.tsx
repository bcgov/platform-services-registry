'use client';

import { Alert, Button } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import LoadingBox from '@/components/generic/LoadingBox';
import {
  buildRollingFiscalForecastMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
  getProviderBudgetCurrency,
  sumEnabledEnvironmentBudgets,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { useForecastBudgetCad } from '@/components/public-cloud/forecast/useForecastBudgetCad';
import { getPublicCloudProductForecast } from '@/services/backend/public-cloud/forecast';
import { usePublicProductState } from '@/states/global';

function getForecastLoadErrorMessage(error: unknown) {
  const axiosMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (axiosMessage) return axiosMessage;

  if (error instanceof Error && error.message) return error.message;

  return 'Failed to load forecast data';
}

export default function PublicCloudForecastSection({ licencePlate }: Readonly<{ licencePlate: string }>) {
  const [, productSnap] = usePublicProductState();
  const product = productSnap.currentProduct;
  const canViewForecast = Boolean(product?._permissions.viewForecast);
  const canEditForecast = Boolean(product?._permissions.editForecast);
  const queryClient = useQueryClient();
  const { watch } = useFormContext();

  const budgetDev = watch('budget.dev');
  const budgetTest = watch('budget.test');
  const budgetProd = watch('budget.prod');
  const budgetTools = watch('budget.tools');
  const envDev = watch('environmentsEnabled.development');
  const envTest = watch('environmentsEnabled.test');
  const envProd = watch('environmentsEnabled.production');
  const envTools = watch('environmentsEnabled.tools');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['forecast', licencePlate],
    queryFn: () => getPublicCloudProductForecast(licencePlate),
    enabled: !!licencePlate && canViewForecast,
    retry: 1,
  });

  const handleForecastSaved = () => queryClient.invalidateQueries({ queryKey: ['forecast', licencePlate] });

  const forecast = data?.forecast;

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

  const budgetCurrency = getProviderBudgetCurrency(product?.provider);
  const budgetMonthlyTotal = useMemo(
    () => sumEnabledEnvironmentBudgets(budget, environmentsEnabled),
    [budget, environmentsEnabled],
  );
  const { budgetMonthlyTotalCad } = useForecastBudgetCad(budgetMonthlyTotal, budgetCurrency);

  const draftMonthlyValues = useMemo(
    () => buildRollingFiscalForecastMonths(budgetMonthlyTotalCad ?? 0, 'CAD', new Date()),
    [budgetMonthlyTotalCad],
  );

  if (!product) return null;
  if (!canViewForecast) return null;

  const showPanel = Boolean(data && (forecast || canEditForecast));
  const showEmptyReadOnly = Boolean(data && !forecast && !canEditForecast);

  return (
    <div className="space-y-8">
      {isLoading && (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      )}

      {isError && (
        <Alert color="red" title="Could not load spend forecast">
          <p className="mb-3">{getForecastLoadErrorMessage(error)}</p>
          <Button type="button" size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {showEmptyReadOnly && <p className="text-sm text-gray-600">No forecast yet for this product.</p>}

      {showPanel && (
        <ProjectBudgetForecastPanel
          licencePlate={licencePlate}
          provider={product.provider}
          forecast={
            forecast
              ? {
                  id: forecast.id,
                  horizonMonths: forecast.horizonMonths ?? FISCAL_FORECAST_HORIZON_MONTHS,
                  updatedAt: forecast.updatedAt,
                }
              : null
          }
          monthlyValues={forecast?.monthlyValues ?? draftMonthlyValues}
          budgetMonthlyTotal={budgetMonthlyTotal}
          budgetCurrency={budgetCurrency}
          editable={canEditForecast}
          onSaved={handleForecastSaved}
        />
      )}
    </div>
  );
}
