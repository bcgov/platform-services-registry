'use client';

import { LoadingOverlay, Box } from '@mantine/core';
import Pagination from '@/components/generic/table/Pagination';
import TableFooter from '@/components/generic/table/TableFooter';
import TableHeader from '@/components/generic/table/TableHeader';

export default function Table({
  title = '',
  description = '',
  page,
  pageSize,
  totalCount,
  onPagination = () => {},
  monthPicker,
  isLoading = false,
  children,
}: {
  title?: string;
  description?: string;
  page: number;
  pageSize: number;
  totalCount: number;
  onPagination?: (page: number, pageSize: number) => void;
  monthPicker?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <TableHeader title={title} description={description}>
        {monthPicker}
      </TableHeader>

      <Box pos="relative" className="min-h-96">
        <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        {!isLoading && children}
      </Box>

      <TableFooter>
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPagination={onPagination}
          isLoading={isLoading}
        />
      </TableFooter>
    </div>
  );
}
