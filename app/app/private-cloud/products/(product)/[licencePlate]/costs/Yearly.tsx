'use client';

import { Button, Tooltip } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostSummary from '@/components/private-cloud/yearly-cost/YearlyCostSummary';
import YearlyCostTable from '@/components/private-cloud/yearly-cost/YearlyCostTable';
import { downloadPrivateCloudYearlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';

export default function Yearly({ licencePlate, session }: { licencePlate: string; session: Session }) {
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  const year = selectedYear.getFullYear().toString();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, year],
    queryFn: () => getYearlyCosts(licencePlate, year),
    enabled: !!licencePlate && !!selectedYear,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (year: string | null) => {
    setSelectedYear(year ? new Date(Number(year)) : new Date());
  };

  return (
    <div>
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-4">
          <Tooltip label="Select a year">
            <YearPickerInput
              placeholder="Select a year"
              value={selectedYear}
              onChange={handleChange}
              maw={200}
              clearable
            />
          </Tooltip>
        </div>
        {data.items.length > 0 && (
          <Button
            loading={downloading}
            onClick={async () => {
              if (!data) return;
              setDownloading(true);
              await downloadPrivateCloudYearlyCosts(licencePlate, year);
              setDownloading(false);
            }}
          >
            Download PDF
          </Button>
        )}
      </div>

      <YearlyCostSummary data={data} />

      {data.items.length > 0 && (
        <div className="my-8">
          <YearlyCostChart data={{ months: data.months, monthDetails: data.monthDetails }} />
        </div>
      )}

      <LoadingBox isLoading={isLoading}>
        <YearlyCostTable data={{ items: data.items, months: data.months, monthDetails: data.monthDetails }} />
      </LoadingBox>
    </div>
  );
}
