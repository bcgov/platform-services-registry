'use client';

import { Table } from '@mantine/core';
import { Button } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import LoadingBox from '@/components/generic/LoadingBox';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudMonthlyCosts, getMonthlyCosts } from '@/services/backend/private-cloud/products';
import { formatDate } from '@/utils/js/date';
import { formatCurrency } from '@/utils/js/number';
import BillingTotals from './BillingTotals';
import MonthlyCostChart from './MonthyCostChart';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductMonthlyCost = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductMonthlyCost(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? format(selectedDate, 'yyyy-MM') : null],
    queryFn: () => getMonthlyCosts(licencePlate, format(selectedDate!, 'yyyy-MM')),
    enabled: !!licencePlate && !!selectedDate,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (date: Date | null) => {
    setSelectedDate(date || new Date());
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Monthly Bills</h1>
      <div className="flex items-center gap-4 mb-6">
        <MonthPickerInput
          label="Select Month"
          placeholder="Pick month"
          value={selectedDate}
          onChange={handleChange}
          maw={200}
          clearable
        />
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

      <div className="my-6">
        <div className="border rounded p-4 grid grid-cols-2 gap-4 bg-gray-50">
          <BillingTotals
            accountCoding={data.accountCoding}
            billingPeriod={data.billingPeriod}
            currentTotal={data.currentTotal}
            estimatedGrandTotal={data.estimatedGrandTotal}
            grandTotal={data.grandTotal}
          />
        </div>
      </div>

      <div className="my-8">
        <MonthlyCostChart items={data.items} selectedDate={selectedDate} />
      </div>

      <LoadingBox isLoading={isLoading}>
        <Table striped verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date Range</Table.Th>
              <Table.Th className="text-right">CPU (cores)</Table.Th>
              <Table.Th className="text-right">Storage (GiB)</Table.Th>
              <Table.Th className="text-right">CPU Cost</Table.Th>
              <Table.Th className="text-right">Storage Cost</Table.Th>
              <Table.Th className="text-right">Total Cost</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.items.map((item: any, idx: number) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash;{' '}
                  {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}
                </Table.Td>
                <Table.Td className="text-right">{item.cpu}</Table.Td>
                <Table.Td className="text-right">{item.storage}</Table.Td>
                <Table.Td className="text-right">{formatCurrency(item.cpuCost)}</Table.Td>
                <Table.Td className="text-right">{formatCurrency(item.storageCost)}</Table.Td>
                <Table.Td className="text-right">{formatCurrency(item.totalCost)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </LoadingBox>
    </div>
  );
});
