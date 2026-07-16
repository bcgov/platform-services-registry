'use client';

import { Alert, Button } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingBox from '@/components/generic/LoadingBox';
import { FISCAL_FORECAST_HORIZON_MONTHS } from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { useFormForecastBudget } from '@/components/public-cloud/forecast/useFormForecastBudget';
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
  const { budgetMonthlyTotal, budgetCurrency, draftMonthlyValues } = useFormForecastBudget(product?.provider);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['forecast', licencePlate],
    queryFn: () => getPublicCloudProductForecast(licencePlate),
    enabled: !!licencePlate && canViewForecast,
    retry: 1,
  });

  const handleForecastSaved = () => queryClient.invalidateQueries({ queryKey: ['forecast', licencePlate] });

  const forecast = data?.forecast;

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
