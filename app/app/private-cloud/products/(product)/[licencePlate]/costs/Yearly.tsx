'use client';

import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import { getYearlyCosts } from '@/services/backend/private-cloud/products';
import { PeriodCosts } from '@/types/private-cloud';

export default function Yearly({
  selectedDate,
  licencePlate,
  session,
  onDataLoaded,
  forecastEnabled,
  onLoadingDone,
}: {
  selectedDate: Date;
  licencePlate: string;
  session: Session;
  onDataLoaded: (data: PeriodCosts) => void;
  forecastEnabled: boolean;
  onLoadingDone: (isLoading: boolean) => void;
}) {
  const year = selectedDate.getFullYear().toString();
  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, year],
    queryFn: () => getYearlyCosts(licencePlate, year),
    enabled: !!licencePlate && !!selectedDate,
  });

  useEffect(() => {
    onLoadingDone(isLoading);
  }, [isLoading, onLoadingDone]);

  useEffect(() => {
    if (data) {
      onDataLoaded(data);
    }
  }, [data, onDataLoaded]);

  if (!data || !session.previews.costRecovery) {
    return null;
  }

  return (
    <>
      {data.items.length > 0 && (
        <YearlyCostChart
          data={{ timeUnits: data.timeUnits, timeDetails: data.timeDetails, billingPeriod: data.billingPeriod }}
          isForecastEnabled={forecastEnabled}
        />
      )}
    </>
  );
}
