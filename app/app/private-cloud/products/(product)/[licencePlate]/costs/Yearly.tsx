'use client';

import { Button, Tooltip } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useState } from 'react';
import DataTable from '@/components/generic/data-table/DataTable';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostSummary from '@/components/private-cloud/yearly-cost/YearlyCostSummary';
import { monthlyCostColumns, periodicCostColumns } from '@/constants/private-cloud';
import { downloadPrivateCloudYearlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';
import { MonthlyCostMetric, PeriodicCostMetric } from '@/types/private-cloud';

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

  const handleChange = (value: string | null) => {
    setSelectedYear(value ? new Date(parseInt(value, 10), 0, 1) : new Date());
  };

  const monthlyCostData = data.months.map((month, idx) => {
    const { cpuToDate, storageToDate, cpuToProjected, storageToProjected } = data.monthDetails;
    const totalCost = cpuToDate[idx] + storageToDate[idx] + cpuToProjected[idx] + storageToProjected[idx];

    return {
      month,
      monthDetails: {
        cpuToDate: cpuToDate[idx],
        storageToDate: storageToDate[idx],
        cpuToProjected: cpuToProjected[idx],
        storageToProjected: storageToProjected[idx],
        totalCost,
      },
    };
  });

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
        <DataTable<PeriodicCostMetric> data={data.items} columns={periodicCostColumns} defaultPageSize={5} />
        <DataTable<MonthlyCostMetric> data={monthlyCostData} columns={monthlyCostColumns} defaultPageSize={5} />
      </LoadingBox>
    </div>
  );
}
