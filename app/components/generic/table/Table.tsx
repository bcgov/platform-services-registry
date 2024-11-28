'use client';

import { LoadingOverlay, Box, ComboboxData } from '@mantine/core';
import { useState } from 'react';
import Pagination from './Pagination';
import SearchFilterExport from './SearchFilterExport';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';

export default function Table({
  title = '',
  description = '',
  page,
  pageSize,
  totalCount,
  search = '',
  onPagination = () => {},
  onSearch,
  onExport,
  onSort,
  sortOptions = [],
  sortKey = '',
  filters,
  isLoading = false,
  children,
}: {
  title?: string;
  description?: string;
  page: number;
  pageSize: number;
  totalCount: number;
  search?: string;
  onPagination?: (page: number, pageSize: number) => void;
  onSearch?: (search: string) => void;
  onExport?: () => Promise<boolean>;
  onSort?: (sortKey: string) => void;
  sortOptions?: ComboboxData;
  sortKey?: string;
  filters?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <TableHeader title={title} description={description}>
        {(onSearch || onExport || filters) && (
          <SearchFilterExport
            initialSearch={search}
            onSearch={onSearch}
            onExport={onExport}
            onSort={onSort}
            sortOptions={sortOptions}
            sortKey={sortKey}
          >
            {filters}
          </SearchFilterExport>
        )}
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
