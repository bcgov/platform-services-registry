'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import MonthlyCostChart from '@/components/private-cloud/monthly-cost/MonthlyCostChart';
import { getMonthlyCosts } from '@/services/backend/private-cloud/products';
import { MonthlyCost } from '@/types/private-cloud';

export default function Monthly({
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
  onDataLoaded: (data: MonthlyCost) => void;
  forecastEnabled: boolean;
  onLoadingDone: (isLoading: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? format(selectedDate, 'yyyy-MM') : null],
    queryFn: () => getMonthlyCosts(licencePlate, format(selectedDate!, 'yyyy-MM')),
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
        <MonthlyCostChart
          data={{ days: data.days, dayDetails: data.dayDetails, billingPeriod: data.billingPeriod }}
          isForecastEnabled={forecastEnabled}
        />
      )}
    </>
  );
}
