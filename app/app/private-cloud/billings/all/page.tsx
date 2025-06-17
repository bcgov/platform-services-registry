'use client';

import { Button } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio/react';
import Table from '@/components/generic/table/Table';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudAdminMonthlyCosts, getPrivateCloudAdminMonthlyCosts } from '@/services/backend/admin';
import { getDateFromYyyyMmDd } from '@/utils/js';
import AdminCostTableBody from './AdminCostTableBody';
import { pageState } from './state';

const billingPage = createClientPage({
  permissions: [GlobalPermissions.ViewPrivateCloudBilling],
  fallbackUrl: 'login?callbackUrl=/home',
});

export default billingPage(({ session }) => {
  const snap = useSnapshot(pageState);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);
  const formattedYearMonth = format(snap.yearMonth!, 'yyyy-MM');

  const { data, isLoading } = useQuery({
    queryKey: ['costItem', snap.yearMonth],
    queryFn: () => getPrivateCloudAdminMonthlyCosts(formattedYearMonth),
  });

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    pageState.yearMonth = `${year}-${month}`;
  }, [selectedDate]);

  if (!session?.previews.costRecovery) return null;

  const totalCount = data?.totalCount || 0;
  const totalCost = data?.totalCost || 0;
  const allBillings = data?.items || [];

  const handleChange = (date: string | null) => {
    setSelectedDate(date ? getDateFromYyyyMmDd(date) : new Date());
    pageState.page = 1;
    pageState.pageSize = 10;
  };

  const page = snap.page;
  const pageSize = snap.pageSize;
  const currentPageBillings = allBillings.slice((page - 1) * pageSize, page * pageSize);
  const yearMonth = snap.yearMonth;

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
      {allBillings.length > 0 && (
        <div className="w-full md:w-auto flex justify-end">
          <Button
            loading={downloading}
            onClick={async () => {
              if (!data) return;
              setDownloading(true);
              await downloadPrivateCloudAdminMonthlyCosts(yearMonth, data.totalCost);
              setDownloading(false);
            }}
            className="ml-auto"
          >
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
        headerContent={monthPicker}
        isLoading={isLoading}
      >
        <AdminCostTableBody {...{ data: currentPageBillings, totalCost, totalCount, yearMonth, page, pageSize }} />
      </Table>
    </>
  );
});
