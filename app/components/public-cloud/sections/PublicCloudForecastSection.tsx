'use client';

import { Alert, Button } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { FISCAL_FORECAST_HORIZON_MONTHS } from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { createPublicCloudForecast, getPublicCloudProductForecast } from '@/services/backend/public-cloud/forecast';
import { usePublicProductState } from '@/states/global';

function sumEnabledEnvironmentBudgets(product: {
  budget?: { dev?: number; test?: number; prod?: number; tools?: number } | null;
  environmentsEnabled?: {
    development?: boolean;
    test?: boolean;
    production?: boolean;
    tools?: boolean;
  } | null;
}) {
  const budget = product.budget;
  const enabled = product.environmentsEnabled;
  if (!budget || !enabled) return 0;

  let total = 0;
  if (enabled.development) total += budget.dev ?? 0;
  if (enabled.test) total += budget.test ?? 0;
  if (enabled.production) total += budget.prod ?? 0;
  if (enabled.tools) total += budget.tools ?? 0;
  return Math.round(total);
}

export default function PublicCloudForecastSection({ licencePlate }: Readonly<{ licencePlate: string }>) {
  const [, productSnap] = usePublicProductState();
  const product = productSnap.currentProduct;
  const canViewForecast = product?._permissions?.viewForecast;
  const canEditForecast = Boolean(product?._permissions?.editForecast);
  const queryClient = useQueryClient();
  const autoCreateStarted = useRef(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['forecast', licencePlate],
    queryFn: () => getPublicCloudProductForecast(licencePlate),
    enabled: !!licencePlate && canViewForecast,
    retry: 1,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['forecast', licencePlate] });

  const createForecast = useMutation({
    mutationFn: () => createPublicCloudForecast(licencePlate),
    onSuccess: refresh,
    onError: () => {
      // Another tab/request may have created it; refresh either way.
      refresh();
    },
  });

  const forecast = data?.forecast;
  const budgetMonthlyTotal = useMemo(() => (product ? sumEnabledEnvironmentBudgets(product) : 0), [product]);

  // Auto-create a forecast seeded with the sum of enabled environment budgets for every month.
  useEffect(() => {
    if (autoCreateStarted.current) return;
    if (!data || forecast || !canEditForecast || createForecast.isPending) return;
    autoCreateStarted.current = true;
    createForecast.mutate();
  }, [data, forecast, canEditForecast, createForecast]);

  return (
    <div className="space-y-8">
      {canViewForecast && (
        <>
          {(isLoading || (!forecast && canEditForecast && (createForecast.isPending || !createForecast.isError))) && (
            <LoadingBox isLoading>
              <div className="min-h-24" />
            </LoadingBox>
          )}

          {isError && (
            <Alert color="red" title="Could not load spend forecast">
              <p className="mb-3">
                {(error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
                  (error as Error)?.message ??
                  'Failed to load forecast data'}
              </p>
              <Button type="button" size="xs" variant="light" onClick={() => refetch()}>
                Retry
              </Button>
            </Alert>
          )}

          {data && (
            <section className="space-y-4">
              {!forecast ? (
                <div className="text-sm text-gray-600 space-y-3">
                  {canEditForecast ? (
                    createForecast.isError ? (
                      <>
                        <p>Could not create a forecast from the product budget. You can retry.</p>
                        <Button
                          type="button"
                          variant="default"
                          loading={createForecast.isPending}
                          onClick={() => createForecast.mutate()}
                        >
                          Create forecast from product budget
                        </Button>
                      </>
                    ) : (
                      <p>Creating forecast from product budget estimates…</p>
                    )
                  ) : (
                    <p>No forecast yet for this product.</p>
                  )}
                </div>
              ) : (
                <ProjectBudgetForecastPanel
                  licencePlate={licencePlate}
                  provider={product?.provider}
                  forecast={{
                    id: forecast.id,
                    horizonMonths: forecast.horizonMonths ?? FISCAL_FORECAST_HORIZON_MONTHS,
                    updatedAt: forecast.updatedAt,
                  }}
                  monthlyValues={forecast.monthlyValues ?? []}
                  budgetMonthlyTotal={budgetMonthlyTotal}
                  editable={canEditForecast}
                  onSaved={refresh}
                />
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
