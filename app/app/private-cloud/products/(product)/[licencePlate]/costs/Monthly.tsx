'use client';

import { Button, Tooltip } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import MonthlyCostSummary from '@/components/private-cloud/monthly-cost/MonthlyCostSummary';
import MonthlyCostTable from '@/components/private-cloud/monthly-cost/MonthlyCostTable';
import MonthlyCostChart from '@/components/private-cloud/monthly-cost/MonthyCostChart';
import { downloadPrivateCloudMonthlyCosts, getMonthlyCosts } from '@/services/backend/private-cloud/products';
import { getDateFromYyyyMmDd } from '@/utils/js';

export default function Monthly({ licencePlate, session }: { licencePlate: string; session: Session }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? format(selectedDate, 'yyyy-MM') : null],
    queryFn: () => getMonthlyCosts(licencePlate, format(selectedDate!, 'yyyy-MM')),
    enabled: !!licencePlate && !!selectedDate,
  });

  if (!data || !session.previews.costRecovery) {
    return null;
  }

  const handleChange = (date: string | null) => {
    setSelectedDate(date ? getDateFromYyyyMmDd(date) : new Date());
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Tooltip label="Select a month">
          <MonthPickerInput
            placeholder="Select a month"
            value={selectedDate}
            onChange={handleChange}
            maw={200}
            clearable
          />
        </Tooltip>

        {data.items.length > 0 && (
          <div className="ml-auto">
            <Button
              loading={downloading}
              onClick={async () => {
                if (!data) return;
                setDownloading(true);
                await downloadPrivateCloudMonthlyCosts(licencePlate, format(selectedDate, 'yyyy-MM'));
                setDownloading(false);
              }}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <MonthlyCostSummary data={data} />

      {data.items.length > 0 && (
        <div className="my-8">
          <MonthlyCostChart data={{ days: data.days, dayDetails: data.dayDetails }} />
        </div>
      )}

      <LoadingBox isLoading={isLoading}>
        <MonthlyCostTable data={{ items: data.items, days: data.days, dayDetails: data.dayDetails }} />
      </LoadingBox>
    </div>
  );
}
