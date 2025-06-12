'use client';

import { Tooltip } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Session } from 'next-auth';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import GenericTable from '@/components/generic/table/GenericTable';
import TableSummary from '@/components/private-cloud/generic-table-summary/TableSummary';
import { tableColumns, tableColumnsSummary } from '@/constants/private-cloud';
import { getTableData } from '@/helpers/product';
import { getMonthlyCosts } from '@/services/backend/private-cloud/products';
import { tableDataBodySchema, tableDataSummaryBodySchema } from '@/validation-schemas';

export default function CustomTableTesting({ session }: { session: Session }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const licencePlate = 'caf09b';

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
      </div>

      <LoadingBox isLoading={isLoading}>
        <GenericTable
          tableProps={{
            tableColumns: tableColumnsSummary,
            tableData: TableSummary(data),
            tableDataSchema: tableDataSummaryBodySchema,
            pageSize: 10,
          }}
        />
        <GenericTable
          tableProps={{
            tableColumns,
            tableData: getTableData(data),
            tableDataSchema: tableDataBodySchema,
            pageSize: 10,
          }}
        />
      </LoadingBox>
    </div>
  );
}
