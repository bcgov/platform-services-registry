'use client';

import { Box, Button, LoadingOverlay, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import DataTable from '@/components/generic/data-table/DataTable';
import CostSummary from '@/components/private-cloud/CostSummary';
import DateSelector from '@/components/private-cloud/DateSelector';
import { dailyCostColumns, getDailyCostData, getMonthlyCostData, GlobalRole, monthlyCostColumns } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  DailyCostMetric,
  MonthlyCost,
  MonthlyCostMetric,
  QuarterlyCost,
  TimeView,
  YearlyCost,
} from '@/types/private-cloud';
import { formatAsYearQuarter, formatCurrency, getDateFromYyyyMmDd, getMonthNameFromNumber } from '@/utils/js';
import Monthly from './Monthly';
import Quarterly from './Quarterly';
import Yearly from './Yearly';

const tabClassname = `
  relative px-4 py-2 text-sm font-medium border-x border-t border-gray-200
  first:rounded-t-md last:rounded-t-md
  data-[active=true]:bg-zinc-100 data-[active=true]:font-bold data-[active=true]:text-gray-900 data-[active=true]:border-b-transparent border-10
  data-[active=false]:bg-white data-[active=false]:text-gray-500 data-[active=false]:border-b border-b-gray-200 hover:data-[active=false]:bg-gray-100
`;

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductCosts = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

const calculateTotalCost = <T extends { dayDetails?: { totalCost: number }; monthDetails?: { totalCost: number } }>(
  data: T[],
): number => {
  return data.reduce((sum, item) => {
    const cost = item.dayDetails?.totalCost ?? item.monthDetails?.totalCost ?? 0;
    return sum + cost;
  }, 0);
};

function TableFooter({ label, totalCost }: { label: string; totalCost: number }) {
  return (
    <tr>
      <td colSpan={4} />
      <td colSpan={1} className="p-2 text-left">
        <strong>Current total cost for {label}</strong>
      </td>
      <td colSpan={1} className="p-2 text-left">
        <strong>{formatCurrency(totalCost)}</strong>
      </td>
    </tr>
  );
}

export default privateCloudProductCosts(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [costData, setCostData] = useState<MonthlyCost | QuarterlyCost | YearlyCost>();
  const [forecastEnabled, setForecastEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<TimeView>(TimeView.Monthly);
  const [isLoading, setIsLoading] = useState(true);

  const { licencePlate = '' } = pathParams ?? {};

  const handleDateChange = (date: string | null) => {
    setIsLoading(true);
    if (!date) {
      setSelectedDate(new Date());
      return;
    }

    if (viewMode === TimeView.Monthly || viewMode === TimeView.Quarterly) {
      setSelectedDate(getDateFromYyyyMmDd(date));
    } else {
      const year = parseInt(date.split('-')[0], 10);
      setSelectedDate(new Date(year, 0, 1));
    }
  };

  const handleDataLoaded = (data: MonthlyCost | QuarterlyCost | YearlyCost) => {
    setCostData(data);
    setIsLoading(false);
  };

  const handleModeChange = (viewMode: TimeView) => {
    setIsLoading(true);
    setViewMode(viewMode);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const params = await getPathParams();
      setPathParams(params);
    };

    loadInitialData();
  }, [getPathParams]);

  if (!session) {
    return null;
  }

  const isMonthlyCost = costData && viewMode === TimeView.Monthly && 'days' in costData;
  const isQuarterlyOrYearlyCost =
    costData && (viewMode === TimeView.Quarterly || viewMode === TimeView.Yearly) && 'months' in costData;

  const dailyCostData = isMonthlyCost ? getDailyCostData(costData) : [];
  const monthlyCostData = isQuarterlyOrYearlyCost ? getMonthlyCostData(costData) : [];

  const totalDailyCost = calculateTotalCost(dailyCostData);
  const totalMonthlyCost = calculateTotalCost(monthlyCostData);

  const selectedPeriod =
    viewMode === TimeView.Monthly ? getMonthNameFromNumber(selectedDate.getMonth() + 1) : costData?.billingPeriod;

  const dateSelectorProps = {
    selectedDate,
    handleDateChange,
    viewMode,
    onModeChange: handleModeChange,
    onForecastChange: setForecastEnabled,
    forecastEnabled,
    data: costData!,
  };

  const tableProps = {
    disablePagination: true,
    footer: totalDailyCost ? (
      <TableFooter label={selectedPeriod!} totalCost={totalDailyCost} />
    ) : (
      <TableFooter label={selectedPeriod!} totalCost={totalMonthlyCost} />
    ),
  };

  const renderChart = () => {
    const commonProps = {
      selectedDate,
      licencePlate,
      session,
      onDataLoaded: handleDataLoaded,
      forecastEnabled,
      onLoadingDone: setIsLoading,
    };

    switch (viewMode) {
      case TimeView.Monthly:
        return <Monthly {...commonProps} />;
      case TimeView.Quarterly:
        return <Quarterly {...commonProps} />;
      case TimeView.Yearly:
        return <Yearly {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <Box pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'pink', type: 'bars' }}
        />
        <div className="relative">
          <CostSummary data={costData!} selectedDate={selectedDate} viewMode={viewMode} />
          <Button onClick={async () => {}} className="absolute right-0 top-[10px]">
            Download PDF
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Consumption data</h1>

        <Tabs variant="unstyled" defaultValue="graph">
          <Tabs.List
            grow
            className="max-w-60 border-t border-2-r border-l border-b-0 rounded-t-md shadow-sm overflow-hidden"
          >
            <Tabs.Tab value="graph" className={`${tabClassname} border-r-2 border-gray-200`}>
              Graph
            </Tabs.Tab>
            <Tabs.Tab value="table" className={tabClassname}>
              Table
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel className="border" value="graph">
            <DateSelector {...dateSelectorProps} />
            {renderChart()}
          </Tabs.Panel>

          <Tabs.Panel className="border" value="table">
            <DateSelector {...dateSelectorProps} showForecastSwitch={false} showTable />
            {viewMode === TimeView.Monthly && dailyCostData.length > 0 && (
              <div className="mx-16 mt-8 mb-14">
                <DataTable<DailyCostMetric> data={dailyCostData} columns={dailyCostColumns} {...tableProps} />
              </div>
            )}
            {(viewMode === TimeView.Quarterly || viewMode === TimeView.Yearly) && monthlyCostData.length > 0 && (
              <div className="mx-16 mt-8 mb-14">
                <DataTable<MonthlyCostMetric> data={monthlyCostData} columns={monthlyCostColumns} {...tableProps} />
              </div>
            )}
          </Tabs.Panel>
        </Tabs>
      </Box>
    </div>
  );
});
