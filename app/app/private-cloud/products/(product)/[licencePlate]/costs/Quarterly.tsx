'use client';

import { Button, Tooltip } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useState } from 'react';
import CostStatusBadge from '@/components/badges/CostStatusBadge';
import DataTable from '@/components/generic/data-table/DataTable';
import LoadingBox from '@/components/generic/LoadingBox';
import QuarterlyCostChart from '@/components/private-cloud/quarterly-cost/QuarterlyCostChart';
import QuarterlyCostSummary from '@/components/private-cloud/quarterly-cost/QuarterlyCostSummary';
import { monthlyCostCommonColumns, periodicCostCommonColumns } from '@/constants/private-cloud';
import { downloadPrivateCloudQuarterlyCosts, getQuarterlyCosts } from '@/services/backend/private-cloud/products';
import { CostTableColumnDef, MonthlyCostMetric, PeriodicCostMetric } from '@/types/private-cloud';
import { formatAsYearQuarter, getDateFromYyyyMmDd, getMonthNameFromNumber } from '@/utils/js';

export default function Quarterly({ licencePlate, session }: { licencePlate: string; session: Session }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? formatAsYearQuarter(selectedDate) : null],
    queryFn: () => getQuarterlyCosts(licencePlate, formatAsYearQuarter(selectedDate)),
    enabled: !!licencePlate && !!selectedDate,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (date: string | null) => {
    setSelectedDate(date ? getDateFromYyyyMmDd(date) : new Date());
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
      <div className="flex items-center gap-4 mb-6">
        <Tooltip label="Select a month within the quarter">
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
                await downloadPrivateCloudQuarterlyCosts(licencePlate, formatAsYearQuarter(selectedDate));
                setDownloading(false);
              }}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <QuarterlyCostSummary data={data} />

      {data.items.length > 0 && (
        <div className="my-8">
          <QuarterlyCostChart data={{ months: data.months, monthDetails: data.monthDetails }} />
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
