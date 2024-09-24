'use client';

import { Button, Divider, Grid, LoadingOverlay, Box, ComboboxData } from '@mantine/core';
import { createContext, useContext, useRef, useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import Pagination from './Pagination';
import SearchFilterExport from './SearchFilterExport';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';

const defaultValue = {
  page: 0,
  pageSize: 0,
  totalCount: 0,
  search: '',
  sortKey: '',
  onPagination: (page: number, pageSize: number) => {},
  isLoading: false,
};

const TableContext = createContext(defaultValue);

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
  const state = useRef(proxy({ ...defaultValue })).current;

  useEffect(() => {
    state.page = page;
    state.pageSize = pageSize;
    state.totalCount = totalCount;
    state.search = search;
    state.sortKey = sortKey;
    state.onPagination = onPagination;
    state.isLoading = isLoading;
  }, [state, page, pageSize, totalCount, search, onPagination, isLoading]);

  return (
    <TableContext.Provider value={state}>
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
          {children}
        </Box>

        <TableFooter>
          <Pagination />
        </TableFooter>
      </div>
    </TableContext.Provider>
  );
}

export function useTableState() {
  const state = useContext(TableContext);
  const snapshot = useSnapshot(state);
  return { state, snapshot };
}
