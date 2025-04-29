'use client';

import { Table } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import ExportButton from '@/components/buttons/ExportButton';
import LoadingBox from '@/components/generic/LoadingBox';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudMonthlyCosts, getMonthlyCosts } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductMonthlyCost = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductMonthlyCost(({ getPathParams }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? format(selectedDate, 'yyyy-MM') : null],
    queryFn: () => getMonthlyCosts(licencePlate, format(selectedDate!, 'yyyy-MM')),
    enabled: !!licencePlate && !!selectedDate,
  });
  if (!data) {
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
        <div className="ml-auto">
          <ExportButton
            onExport={async () => {
              if (!licencePlate || !selectedDate) return false;
              const result = await downloadPrivateCloudMonthlyCosts(licencePlate, format(selectedDate, 'yyyy-MM'));
              return result;
            }}
          />
        </div>
      </div>
      <div className="my-6">
        <div className="border rounded p-4 grid grid-cols-2 gap-4 bg-gray-50">
          <div>
            <strong>Account Coding:</strong> {data.accountCoding}
          </div>
          <div>
            <strong>Billing Period:</strong> {data.billingPeriod}
          </div>
          {data.currentTotal !== -1 && (
            <div>
              <strong>Current Total:</strong> ${data.currentTotal?.toFixed(2)}
            </div>
          )}
          {data.currentTotal !== -1 && (
            <div>
              <strong>Estimated Grand Total:</strong> ${data.estimatedGrandTotal?.toFixed(2)}
            </div>
          )}
          {data.grandTotal !== -1 && (
            <div>
              <strong>Grand Total:</strong> ${data.grandTotal?.toFixed(2)}
            </div>
          )}
        </div>
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
                  {new Date(item.startDate).toLocaleString()}
                  <br />
                  {new Date(item.endDate).toLocaleString()}
                </Table.Td>
                <Table.Td className="text-right">{item.cpu}</Table.Td>
                <Table.Td className="text-right">{item.storage}</Table.Td>
                <Table.Td className="text-right">${item.cpuCost?.toFixed(2)}</Table.Td>
                <Table.Td className="text-right">${item.storageCost?.toFixed(2)}</Table.Td>
                <Table.Td className="text-right">${item.totalCost?.toFixed(2)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </LoadingBox>
    </div>
  );
});
