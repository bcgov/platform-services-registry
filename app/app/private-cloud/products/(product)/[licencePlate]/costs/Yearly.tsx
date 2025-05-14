'use client';
import { Button, Tooltip } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostTable from '@/components/private-cloud/yearly-cost/YearlyCostTable';
import { downloadPrivateCloudYearlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';

export default function Yearly({ licencePlate, session }: { licencePlate: string; session: Session }) {
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  const year = selectedYear.getFullYear().toString();
  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, year],
    queryFn: () => getYearlyCosts(licencePlate, year),
    enabled: !!licencePlate && !!selectedYear,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (year: Date | null) => {
    setSelectedYear(year ?? new Date());
  };

  const yearlyCostData = data?.items;

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
        {yearlyCostData.length > 0 && (
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

      {data.items.length > 0 && (
        <div className="my-8">
          <YearlyCostChart yearlyCostData={yearlyCostData} />
        </div>
      )}

      <LoadingBox isLoading={isLoading}>
        <YearlyCostTable yearlyCostData={yearlyCostData} currentYear={year} />
      </LoadingBox>
    </div>
  );
}
