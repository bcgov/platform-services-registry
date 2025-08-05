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
import {
  periodCostItemTableColumns,
  generateDailyCostDetailTableColumns,
  generateMonthlyCostDetailTableColumns,
  GlobalRole,
} from '@/constants';
import createClientPage from '@/core/client-page';
import { getPeriodCostDetailTableDataRow } from '@/helpers/private-cloud';
import {
  downloadPrivateCloudMonthlyCosts,
  downloadPrivateCloudQuarterlyCosts,
  downloadPrivateCloudYearlyCosts,
} from '@/services/backend/private-cloud/products';
import { CostDetailTableDataRow, PeriodCosts, CostPeriod, PeriodCostItem } from '@/types/private-cloud';
import { formatAsYearQuarter, formatCurrency, getMonthNameFromNumber } from '@/utils/js';
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

function GraphView({ period, data, forecast }: { period: CostPeriod; data: PeriodCosts; forecast: boolean }) {
  switch (period) {
    case CostPeriod.Monthly:
      return <MonthlyCostChart data={data} forecast={forecast} />;
    case CostPeriod.Quarterly:
      return <QuarterlyCostChart data={data} forecast={forecast} />;
    case CostPeriod.Yearly:
      return <YearlyCostChart data={data} forecast={forecast} />;
    default:
      return null;
  }
}

function PeriodLabels({
  period,
  data,
  forecast,
  currentMonth,
}: {
  period: CostPeriod;
  data: PeriodCosts;
  forecast: boolean;
  currentMonth: string;
}) {
  return (
    <div className="flex justify-between">
      {[
        {
          condition: data.currentTotal !== -1,
          value: data.currentTotal,
          label:
            period === CostPeriod.Monthly
              ? `Current total cost for ${currentMonth}`
              : `Current total cost for ${data.billingPeriod}`,
        },
        {
          condition: data.grandTotal !== -1,
          value: data.grandTotal,
          label:
            period === CostPeriod.Monthly
              ? `Grand total cost for ${currentMonth}`
              : `Grand total cost for ${data.billingPeriod}`,
        },
        {
          condition: data.estimatedGrandTotal !== -1 && forecast,
          value: data.estimatedGrandTotal,
          label:
            period === CostPeriod.Monthly
              ? `Estimated grand total cost for ${currentMonth}`
              : `Estimated grand total cost for ${data.billingPeriod}`,
        },
      ].map(
        ({ condition, value, label }) =>
          condition && (
            <div
              key={label}
              className="inline-flex mt-4 py-2 px-5 mx-16 bg-zinc-100 items-center justify-between border border-gray-300 rounded-md"
            >
              <strong>{label}:&nbsp;</strong>
              {formatCurrency(value)}
            </div>
          ),
      )}
    </div>
  );
}

export default privateCloudProductCosts(({ getPathParams, session }) => {
  const [, snap] = useCostState();
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
    if (!snap.data) return { itemTable: [], detailTable: [], currentTotal: 0 };

    const detailTable = getPeriodCostDetailTableDataRow(snap.data);
    return {
      itemTable: snap.data.items,
      detailTable,
      currentTotal: snap.data.currentTotal > -1 ? snap.data.currentTotal : snap.data.grandTotal,
    };
  }, [snap.data]);

  if (!session) {
    return null;
  }

  const selectedPeriod =
    snap.period === CostPeriod.Monthly
      ? getMonthNameFromNumber(snap.selectedDate.getMonth() + 1)
      : snap.data?.billingPeriod;

  const detailTableProp = {
    data: pageData.detailTable,
    disablePagination: true,
    footer: <TableFooter label={selectedPeriod} totalCost={pageData.currentTotal} />,
  };

  async function handleDownloadCostPdf() {
    if (!snap.data) return;

    setDownloading(true);

    const pdfDownloadStrategies = {
      [CostPeriod.Monthly]: () => downloadPrivateCloudMonthlyCosts(licencePlate, format(snap.selectedDate, 'yyyy-MM')),
      [CostPeriod.Quarterly]: () =>
        downloadPrivateCloudQuarterlyCosts(licencePlate, formatAsYearQuarter(snap.selectedDate)),
      [CostPeriod.Yearly]: () =>
        downloadPrivateCloudYearlyCosts(licencePlate, snap.selectedDate.getFullYear().toString()),
    };

    const downloadPDF = pdfDownloadStrategies[snap.period];

    if (downloadPDF) {
      await downloadPDF();
    }

    setDownloading(false);
  }

  return (
    <LoadingBox isLoading={snap.isDataLoading} className="my-2">
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
          {snap.data && <GraphView period={snap.period} data={snap.data} forecast={snap.forecast} />}
        </Tabs.Panel>

        <Tabs.Panel className="border" value="table">
          <PeriodSelector licencePlate={licencePlate} />

          {snap.data && (
            <PeriodLabels
              period={snap.period}
              data={snap.data}
              forecast={snap.forecast}
              currentMonth={format(snap.selectedDate, 'MMMM')}
            />
          )}

          <div className="mx-16 mt-8">
            <DataTable<PeriodCostItem>
              columns={periodCostItemTableColumns}
              data={snap.forecast ? pageData.itemTable : pageData.itemTable.filter((item) => item.isPast)}
              disablePagination
            />
          </div>

          <div className="mx-16 mt-8 mb-2">
            {snap.period === CostPeriod.Monthly ? (
              <DataTable<CostDetailTableDataRow>
                columns={generateDailyCostDetailTableColumns(snap.forecast)}
                {...detailTableProp}
              />
            ) : (
              <DataTable<CostDetailTableDataRow>
                columns={generateMonthlyCostDetailTableColumns(snap.forecast)}
                {...detailTableProp}
              />
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </LoadingBox>
  );
});
