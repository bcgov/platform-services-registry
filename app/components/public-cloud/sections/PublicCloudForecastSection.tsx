'use client';

import { Alert, Button } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingBox from '@/components/generic/LoadingBox';
import { FISCAL_FORECAST_HORIZON_MONTHS } from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { createPublicCloudForecast, getPublicCloudProductForecast } from '@/services/backend/public-cloud/forecast';
import { usePublicProductState } from '@/states/global';

export default function PublicCloudForecastSection({ licencePlate }: { licencePlate: string }) {
  const [, productSnap] = usePublicProductState();
  const product = productSnap.currentProduct;
  const canViewForecast = product?._permissions?.viewForecast;
  const canEditForecast = Boolean(product?._permissions?.editForecast);
  const queryClient = useQueryClient();

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
  });

  const forecast = data?.forecast;

  return (
    <div className="space-y-8">
      {canViewForecast && (
        <>
          {isLoading && (
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
                  <p>No forecast yet. Create one from the product budget estimates to enter monthly amounts.</p>
                  {canEditForecast && (
                    <Button
                      type="button"
                      variant="default"
                      loading={createForecast.isPending}
                      onClick={() => createForecast.mutate()}
                    >
                      Create forecast from product budget
                    </Button>
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
