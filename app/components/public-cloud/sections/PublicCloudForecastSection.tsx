'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import FinanceQueryError from '@/components/public-cloud/finance/FinanceQueryError';
import {
  buildRollingFiscalForecastMonths,
  FISCAL_FORECAST_HORIZON_MONTHS,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { getProductFinanceDetail } from '@/services/backend/public-cloud/finance';
import { getPublicCloudProductForecast } from '@/services/backend/public-cloud/forecast';
import { usePublicProductState } from '@/states/global';

export default function PublicCloudForecastSection({ licencePlate }: Readonly<{ licencePlate: string }>) {
  const { data: session } = useSession();
  const [, productSnap] = usePublicProductState();
  const product = productSnap.currentProduct;
  const canViewForecast = Boolean(product?._permissions.viewForecast);
  const canEditForecast = Boolean(product?._permissions.editForecast);
  const canViewFinanceActuals = Boolean(product?._permissions.viewFinanceActuals);
  const showActualVariance = Boolean(session?.previews.publicCloudFinance && canViewFinanceActuals);
  const queryClient = useQueryClient();
  const draftMonthlyValues = useMemo(() => buildRollingFiscalForecastMonths(0, 'CAD', new Date()), []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['forecast', licencePlate],
    queryFn: () => getPublicCloudProductForecast(licencePlate),
    enabled: !!licencePlate && canViewForecast,
    retry: 1,
  });

  const {
    data: financeData,
    isError: isFinanceError,
    error: financeError,
    refetch: refetchFinance,
  } = useQuery({
    queryKey: ['product-finance', licencePlate],
    queryFn: () => getProductFinanceDetail(licencePlate),
    enabled: !!licencePlate && canViewForecast && showActualVariance,
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

      {isError && <FinanceQueryError error={error} onRetry={() => refetch()} title="Could not load spend forecast" />}

      {showActualVariance && isFinanceError && (
        <FinanceQueryError
          error={financeError}
          onRetry={() => refetchFinance()}
          title="Could not load billing actuals"
        />
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
          editable={canEditForecast}
          onSaved={handleForecastSaved}
          showActualVariance={showActualVariance}
          actualsByMonth={financeData?.actuals}
          billingStartedAt={financeData?.billingStartedAt}
          canEditVarianceNotes={canEditForecast}
        />
      )}
    </div>
  );
}
