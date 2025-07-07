'use client';

import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import { getYearlyCosts } from '@/services/backend/private-cloud/products';
import { YearlyCost } from '@/types/private-cloud';

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
  onDataLoaded: (data: YearlyCost) => void;
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
    if (data) {
      onDataLoaded(data);
      onLoadingDone(isLoading);
    }
  }, [data, onDataLoaded, isLoading, onLoadingDone]);

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  return (
    <>
      {data.items.length > 0 && (
        <YearlyCostChart
          data={{ months: data.months, monthDetails: data.monthDetails, billingPeriod: data.billingPeriod }}
          isForecastEnabled={forecastEnabled}
        />
      )}
    </>
  );
}
