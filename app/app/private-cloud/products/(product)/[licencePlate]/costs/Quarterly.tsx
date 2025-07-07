'use client';

import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import QuarterlyCostChart from '@/components/private-cloud/quarterly-cost/QuarterlyCostChart';
import { getQuarterlyCosts } from '@/services/backend/private-cloud/products';
import { QuarterlyCost } from '@/types/private-cloud';
import { formatAsYearQuarter } from '@/utils/js';

export default function Quarterly({
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
  onDataLoaded: (data: QuarterlyCost) => void;
  forecastEnabled: boolean;
  onLoadingDone: (isLoading: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? formatAsYearQuarter(selectedDate) : null],
    queryFn: () => getQuarterlyCosts(licencePlate, formatAsYearQuarter(selectedDate)),
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
        <QuarterlyCostChart
          data={{ months: data.months, monthDetails: data.monthDetails, billingPeriod: data.billingPeriod }}
          isForecastEnabled={forecastEnabled}
        />
      )}
    </>
  );
}
