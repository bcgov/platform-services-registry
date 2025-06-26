'use client';

import { Button, Tooltip } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Session } from 'next-auth';
import { useState } from 'react';
import CostStatusBadge from '@/components/badges/CostStatusBadge';
import DataTable from '@/components/generic/data-table/DataTable';
import LoadingBox from '@/components/generic/LoadingBox';
import MonthlyCostSummary from '@/components/private-cloud/monthly-cost/MonthlyCostSummary';
import MonthlyCostChart from '@/components/private-cloud/monthly-cost/MonthyCostChart';
import { dailyCostCommonColumns, periodicCostCommonColumns } from '@/constants/private-cloud';
import { downloadPrivateCloudMonthlyCosts, getMonthlyCosts } from '@/services/backend/private-cloud/products';
import { CostTableColumnDef, DailyCostMetric, PeriodicCostMetric } from '@/types/private-cloud';
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

  const dailyCostData = data.days.map((day, idx) => {
    const { cpuToDate, storageToDate, cpuToProjected, storageToProjected } = data.dayDetails;
    const totalCost = cpuToDate[idx] + storageToDate[idx] + cpuToProjected[idx] + storageToProjected[idx];

    return {
      day,
      dayDetails: {
        cpuToDate: cpuToDate[idx],
        storageToDate: storageToDate[idx],
        cpuToProjected: cpuToProjected[idx],
        storageToProjected: storageToProjected[idx],
        totalCost,
      },
    };
  });

  const periodicCostColumns: CostTableColumnDef<PeriodicCostMetric>[] = [
    {
      label: 'Data Range',
      value: 'startDate',
      cellProcessor: (item, attr) => CostStatusBadge(item),
    },
    ...periodicCostCommonColumns<PeriodicCostMetric>(),
  ];

  const dailyCostColumns: CostTableColumnDef<DailyCostMetric>[] = [
    { label: 'Day', value: 'day', cellProcessor: (item) => item.day },
    ...dailyCostCommonColumns<DailyCostMetric>(),
  ];

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
        <DataTable<PeriodicCostMetric> data={data.items} columns={periodicCostColumns} defaultPageSize={5} />
        <br />
        <DataTable<DailyCostMetric> data={dailyCostData} columns={dailyCostColumns} defaultPageSize={5} />
      </LoadingBox>
    </div>
  );
}
