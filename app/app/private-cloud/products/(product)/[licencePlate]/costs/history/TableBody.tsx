'use client';

import { Table } from '@mantine/core';
import { YearlyCostDataWithMonthName } from '@/helpers/product';

export interface TableProps {
  data: YearlyCostDataWithMonthName[];
  currentYear: string;
}

export default function TableBody({ data, currentYear }: TableProps) {
  const rows = data.length ? (
    data.map((resource, index) => (
      <Table.Tr key={index}>
        <Table.Td>
          {resource.month} {currentYear}
        </Table.Td>
        <Table.Td>{resource.cpuCost}</Table.Td>
        <Table.Td>{resource.storageCost}</Table.Td>
        <Table.Td>{resource.totalCost}</Table.Td>
      </Table.Tr>
    ))
  ) : (
    <Table.Tr>
      <Table.Td colSpan={5} className="italic">
        No Cost History Found
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" striped withColumnBorders withTableBorder horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Month</Table.Th>
            <Table.Th>CPU Usage Cost (CAD)</Table.Th>
            <Table.Th>Storage Usage Cost (CAD)</Table.Th>
            <Table.Th>Total Cost (CAD)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
