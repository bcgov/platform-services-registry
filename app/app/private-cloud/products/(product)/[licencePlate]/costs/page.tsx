'use client';

import { Tabs, Button } from '@mantine/core';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import DataTable from '@/components/generic/data-table/DataTable';
import LoadingBox from '@/components/generic/LoadingBox';
import CostSummary from '@/components/private-cloud/CostSummary';
import MonthlyCostChart from '@/components/private-cloud/monthly-cost/MonthlyCostChart';
import QuarterlyCostChart from '@/components/private-cloud/quarterly-cost/QuarterlyCostChart';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import { dailyCostColumns, GlobalRole, monthlyCostColumns } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  downloadPrivateCloudMonthlyCosts,
  downloadPrivateCloudQuarterlyCosts,
  downloadPrivateCloudYearlyCosts,
} from '@/services/backend/private-cloud/products';
import { CostDetailTableData, PeriodCosts, CostPeriod } from '@/types/private-cloud';
import { formatAsYearQuarter, formatCurrency, getDateFromYyyyMmDd, getMonthNameFromNumber } from '@/utils/js';
import PeriodSelector from './PeriodSelector';
import { useCostState } from './state';

const tabClassname = `
  relative text-sm font-medium border-x border-t border-gray-200
  first:rounded-t-md last:rounded-t-md
  data-[active=true]:bg-zinc-100 data-[active=true]:font-bold data-[active=true]:text-gray-900 data-[active=true]:border-b-transparent
  data-[active=false]:bg-white data-[active=false]:text-gray-500 data-[active=false]:border-b border-b-gray-200 hover:data-[active=false]:bg-gray-100
`;

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductCosts = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

function TableFooter({ label, totalCost }: { label?: string; totalCost: number }) {
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

function GraphView({
  period,
  data,
  isForecastEnabled,
}: {
  period: CostPeriod;
  data: PeriodCosts;
  isForecastEnabled: boolean;
}) {
  switch (period) {
    case CostPeriod.Monthly:
      return <MonthlyCostChart data={data} isForecastEnabled={isForecastEnabled} />;
    case CostPeriod.Quarterly:
      return <QuarterlyCostChart data={data} isForecastEnabled={isForecastEnabled} />;
    case CostPeriod.Yearly:
      return <YearlyCostChart data={data} isForecastEnabled={isForecastEnabled} />;
    default:
      return null;
  }
}

export default privateCloudProductCosts(({ getPathParams, session }) => {
  const [state, snap] = useCostState();
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [downloading, setDownloading] = useState(false);
  const { licencePlate = '' } = pathParams ?? {};

  useEffect(() => {
    const loadInitialData = async () => {
      const params = await getPathParams();
      setPathParams(params);
    };

    loadInitialData();
  }, [getPathParams]);

  const pageData = useMemo(() => {
    if (!snap.data) return { tableData: [], currentTotal: 0 };

    const { cpuToDate, storageToDate, cpuQuotaToDate, storageQuotaToDate, costToDate } = snap.data.timeDetails;
    const tableData = snap.data.timeUnits.map((timeUnit, idx) => {
      return {
        timeUnit,
        timeDetails: {
          cpuToDate: cpuToDate[idx],
          storageToDate: storageToDate[idx],
          cpuCore: cpuQuotaToDate[idx],
          storageGib: storageQuotaToDate[idx],
          totalCost: costToDate[idx],
        },
      };
    });

    return { tableData, currentTotal: snap.data.currentTotal };
  }, [snap.data]);

  if (!session) {
    return null;
  }

  const selectedPeriod =
    snap.period === CostPeriod.Monthly
      ? getMonthNameFromNumber(snap.selectedDate.getMonth() + 1)
      : snap.data?.billingPeriod;

  const tableProps = {
    disablePagination: true,
    footer: <TableFooter label={selectedPeriod} totalCost={pageData.currentTotal} />,
  };

  async function handleDownloadCostPdf() {
    if (!snap.data) return;
    setDownloading(true);
    const downloadPDF =
      {
        [CostPeriod.Monthly]: () =>
          downloadPrivateCloudMonthlyCosts(licencePlate, format(snap.selectedDate, 'yyyy-MM')),
        [CostPeriod.Quarterly]: () =>
          downloadPrivateCloudQuarterlyCosts(licencePlate, formatAsYearQuarter(snap.selectedDate)),
      }[snap.period] ||
      (() => downloadPrivateCloudYearlyCosts(licencePlate, snap.selectedDate.getFullYear().toString()));
    await downloadPDF();
    setDownloading(false);
  }

  return (
    <LoadingBox isLoading={false} className="my-2">
      <div className="relative">
        {snap.data && (
          <>
            <CostSummary data={snap.data} period={snap.period} />
            <Button
              loading={downloading}
              onClick={async () => {
                handleDownloadCostPdf();
              }}
              className="absolute right-0 top-[10px]"
            >
              Download PDF
            </Button>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4">Details</h1>

      <Tabs variant="unstyled" defaultValue="graph">
        <Tabs.List grow className="max-w-60 overflow-hidden">
          <Tabs.Tab value="graph" className={tabClassname}>
            Graph
          </Tabs.Tab>
          <Tabs.Tab value="table" className={tabClassname}>
            Table
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel className="border" value="graph">
          <PeriodSelector licencePlate={licencePlate} />
          {snap.data && <GraphView period={snap.period} data={snap.data} isForecastEnabled={snap.forecastEnabled} />}
        </Tabs.Panel>

        <Tabs.Panel className="border" value="table">
          <PeriodSelector licencePlate={licencePlate} />
          {snap.period === CostPeriod.Monthly && pageData.tableData.length > 0 && (
            <div className="mx-16 mt-8 mb-14">
              <DataTable<CostDetailTableData> data={pageData.tableData} columns={dailyCostColumns} {...tableProps} />
            </div>
          )}
          {(snap.period === CostPeriod.Quarterly || snap.period === CostPeriod.Yearly) &&
            pageData.tableData.length > 0 && (
              <div className="mx-16 mt-8 mb-14">
                <DataTable<CostDetailTableData>
                  data={pageData.tableData}
                  columns={monthlyCostColumns}
                  {...tableProps}
                />
              </div>
            )}
        </Tabs.Panel>
      </Tabs>
    </LoadingBox>
  );
});
