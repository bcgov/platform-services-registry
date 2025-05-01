'use client';

import { Table } from '@mantine/core';
import { MonthlyCost } from '@/services/backend/private-cloud/products';
import { formatDate } from '@/utils/js/date';
import { formatCurrency } from '@/utils/js/number';

export default function MonthlyCostTable({ data }: { data: Pick<MonthlyCost, 'items'> }) {
  return (
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
        {data.items.length > 0 ? (
          data.items.map((item, idx: number) => (
            <Table.Tr key={idx}>
              <Table.Td>
                {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash; {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}
              </Table.Td>
              <Table.Td className="text-right">{item.total.cpu.value}</Table.Td>
              <Table.Td className="text-right">{item.total.storage.value}</Table.Td>
              <Table.Td className="text-right">{formatCurrency(item.total.cpu.cost)}</Table.Td>
              <Table.Td className="text-right">{formatCurrency(item.total.storage.cost)}</Table.Td>
              <Table.Td className="text-right">{formatCurrency(item.total.subtotal.cost)}</Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={6} className="italic">
              No data available for the selected month.
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
