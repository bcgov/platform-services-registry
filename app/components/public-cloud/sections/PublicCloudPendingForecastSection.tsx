'use client';

import { useMemo } from 'react';
import {
  FISCAL_FORECAST_HORIZON_MONTHS,
  sumEnabledEnvironmentBudgets,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import ProjectBudgetForecastPanel from '@/components/public-cloud/forecast/ProjectBudgetForecastPanel';
import { usePublicProductState } from '@/states/global';

type PendingForecastPayload = {
  monthlyValues?: MonthlyValue[];
  horizonMonths?: number;
};

function parsePendingForecast(value: unknown): PendingForecastPayload | null {
  if (!value || typeof value !== 'object') return null;
  const payload = value as {
    monthlyValues?: { year: number; month: number; amount: number; currency?: string }[];
    horizonMonths?: number;
  };
  return {
    horizonMonths: payload.horizonMonths,
    monthlyValues: (payload.monthlyValues ?? []).map((month) => ({
      year: month.year,
      month: month.month,
      amount: month.amount,
      currency: 'CAD' as const,
    })),
  };
}

export default function PublicCloudPendingForecastSection() {
  const [, snap] = usePublicProductState();
  const request = snap.currentRequest;
  const decisionData = request?.decisionData;
  const pendingForecast = parsePendingForecast(request?.pendingForecast);
  const monthlyValues = pendingForecast?.monthlyValues ?? [];

  const budgetMonthlyTotal = useMemo(() => {
    if (!decisionData) return 0;
    return sumEnabledEnvironmentBudgets(decisionData.budget, decisionData.environmentsEnabled);
  }, [decisionData]);

  if (!request || !decisionData) return null;

  if (monthlyValues.length === 0) {
    return <p className="text-sm text-gray-600">No spend forecast was submitted with this request.</p>;
  }

  return (
    <ProjectBudgetForecastPanel
      forecast={{
        id: `pending-${request.id}`,
        horizonMonths: pendingForecast?.horizonMonths ?? FISCAL_FORECAST_HORIZON_MONTHS,
      }}
      monthlyValues={monthlyValues}
      budgetMonthlyTotal={budgetMonthlyTotal}
      editable={false}
      provider={decisionData.provider}
    />
  );
}
