'use client';

import { Alert, Button } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import {
  FISCAL_FORECAST_HORIZON_MONTHS,
  sumEnabledEnvironmentBudgets,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { createPublicCloudForecast, getPublicCloudProductForecast } from '@/services/backend/public-cloud/forecast';
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
  const autoCreateStarted = useRef(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['forecast', licencePlate],
    queryFn: () => getPublicCloudProductForecast(licencePlate),
    enabled: !!licencePlate && canViewForecast,
    retry: 1,
  });

  const handleForecastSaved = () => queryClient.invalidateQueries({ queryKey: ['forecast', licencePlate] });

  const createForecast = useMutation({
    mutationFn: () => createPublicCloudForecast(licencePlate),
    onSuccess: handleForecastSaved,
    onError: () => {
      // Another tab/request may have created it; refresh either way.
      handleForecastSaved();
    },
  });

  const forecast = data?.forecast;
  const budgetMonthlyTotal = useMemo(() => {
    if (!product) return 0;
    return sumEnabledEnvironmentBudgets(product.budget, product.environmentsEnabled);
  }, [product]);

  // Auto-create a forecast seeded with the sum of enabled environment budgets for every month.
  useEffect(() => {
    if (autoCreateStarted.current) return;
    if (!data || forecast || !canEditForecast || createForecast.isPending) return;
    autoCreateStarted.current = true;
    createForecast.mutate();
  }, [data, forecast, canEditForecast, createForecast]);

  if (!product) return null;
  if (!canViewForecast) return null;

  const showCreatingLoader =
    isLoading || (!forecast && canEditForecast && (createForecast.isPending || !createForecast.isError));

  const handleRetryCreateForecast = () => createForecast.mutate();
  const handleRefetchForecast = () => refetch();

  let emptyForecastContent = <p>No forecast yet for this product.</p>;
  if (canEditForecast && createForecast.isError) {
    emptyForecastContent = (
      <>
        <p>Could not create a forecast from the product budget. You can retry.</p>
        <Button type="button" variant="default" loading={createForecast.isPending} onClick={handleRetryCreateForecast}>
          Create forecast from product budget
        </Button>
      </>
    );
  } else if (canEditForecast) {
    emptyForecastContent = <p>Creating forecast from product budget estimates…</p>;
  }

  return (
    <div className="space-y-8">
      {showCreatingLoader && (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      )}

      {isError && (
        <Alert color="red" title="Could not load spend forecast">
          <p className="mb-3">{getForecastLoadErrorMessage(error)}</p>
          <Button type="button" size="xs" variant="light" onClick={handleRefetchForecast}>
            Retry
          </Button>
        </Alert>
      )}

      {data && !forecast && <div className="text-sm text-gray-600 space-y-3">{emptyForecastContent}</div>}

      {data && forecast && (
        <ProjectBudgetForecastPanel
          licencePlate={licencePlate}
          provider={product.provider}
          forecast={{
            id: forecast.id,
            horizonMonths: forecast.horizonMonths ?? FISCAL_FORECAST_HORIZON_MONTHS,
            updatedAt: forecast.updatedAt,
          }}
          monthlyValues={forecast.monthlyValues ?? []}
          budgetMonthlyTotal={budgetMonthlyTotal}
          editable={canEditForecast}
          onSaved={handleForecastSaved}
        />
      )}
    </div>
  );
}
