'use client';

import { Button } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { useSnapshot } from 'valtio/react';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPrivateCloudAdminMonthlyCosts } from '@/services/backend/admin';
import { pageState } from './state';
import Table from './Table';
import TableBody from './TableBody';

const billingPage = createClientPage({
  permissions: [GlobalPermissions.ViewPrivateCloudBilling],
  fallbackUrl: 'login?callbackUrl=/home',
});

export default billingPage(({ session }) => {
  if (!session?.previews.costRecovery) return null;
  const snap = useSnapshot(pageState);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);
  let totalCount = 0;
  let billings = [];
  let totalCost = 0;

  const { data, isLoading } = useQuery({
    queryKey: ['costItem', snap.yearMonth, snap.page, snap.pageSize],
    queryFn: () => getPrivateCloudAdminMonthlyCosts(format(snap.yearMonth!, 'yyyy-MM'), snap.page, snap.pageSize),
    refetchInterval: 2000,
  });

  if (!isLoading && data) {
    billings = data.items;
    totalCount = data.totalCount;
    totalCost = data.totalCost;
  }

  const handleChange = (date: Date | null) => {
    setSelectedDate(date || new Date());
    pageState.page = 1;
    pageState.pageSize = 10;
  };

  const year = selectedDate.getFullYear();
  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');

  pageState.yearMonth = `${year}-${month}`;

  const monthPicker = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
      <div className="w-full md:w-auto">
        <MonthPickerInput
          label="Select Month"
          placeholder="Pick month"
          value={selectedDate}
          onChange={handleChange}
          maw={200}
          clearable
        />
      </div>

      {billings.length > 0 && (
        <div className="w-full md:w-auto flex justify-end">
          <Button loading={downloading} onClick={async () => {}} className="ml-auto">
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Table
        title="Private Cloud Billing"
        totalCount={totalCount}
        page={snap.page ?? 1}
        pageSize={snap.pageSize ?? 10}
        onPagination={(page: number, pageSize: number) => {
          pageState.page = page;
          pageState.pageSize = pageSize;
        }}
        monthPicker={monthPicker}
        isLoading={isLoading}
      >
        <TableBody {...{ billings, totalCost, totalCount, yearMonth: snap.yearMonth, page: snap.page }} />
      </Table>
    </>
  );
});
