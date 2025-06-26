'use client';

import { Button, Tooltip } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useState } from 'react';
import CostStatusBadge from '@/components/badges/CostStatusBadge';
import DataTable from '@/components/generic/data-table/DataTable';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostSummary from '@/components/private-cloud/yearly-cost/YearlyCostSummary';
import { monthlyCostCommonColumns, periodicCostCommonColumns } from '@/constants/private-cloud';
import { downloadPrivateCloudYearlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';
import { CostTableColumnDef, MonthlyCostMetric, PeriodicCostMetric } from '@/types/private-cloud';
import { getMonthNameFromNumber } from '@/utils/js';

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

  const periodicCostColumns: CostTableColumnDef<PeriodicCostMetric>[] = [
    { label: 'Data Range', value: 'startDate', cellProcessor: (item, attr) => CostStatusBadge(item) },
    ...periodicCostCommonColumns<PeriodicCostMetric>(),
  ];

  const monthlyCostColumns: CostTableColumnDef<MonthlyCostMetric>[] = [
    { label: 'Month', value: 'month', cellProcessor: (item) => getMonthNameFromNumber(item.month) },
    ...monthlyCostCommonColumns<MonthlyCostMetric>(),
  ];

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
        <br />
        <DataTable<MonthlyCostMetric> data={monthlyCostData} columns={monthlyCostColumns} defaultPageSize={5} />
      </LoadingBox>
    </div>
  );
}
