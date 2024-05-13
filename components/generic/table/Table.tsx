'use client';

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
  onPagination: (page: number, pageSize: number) => {},
  isLoading: false,
};

const TableContext = createContext(defaultValue);

export default function Table({
  title,
  description,
  page,
  pageSize,
  totalCount,
  search = '',
  onPagination = () => {},
  onSearch,
  onExport,
  filters,
  isLoading = false,
  children,
}: {
  title: string;
  description: string;
  page: number;
  pageSize: number;
  totalCount: number;
  search?: string;
  onPagination?: (page: number, pageSize: number) => void;
  onSearch?: (search: string) => void;
  onExport?: () => Promise<boolean>;
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
    state.onPagination = onPagination;
    state.isLoading = isLoading;
  }, [state, page, pageSize, totalCount, search, onPagination, isLoading]);

  return (
    <TableContext.Provider value={state}>
      <div className="border-2 rounded-xl overflow-hidden">
        <TableHeader title={title} description={description}>
          {(onSearch || onExport || filters) && (
            <SearchFilterExport initialSearch={search} onSearch={onSearch} onExport={onExport}>
              {filters}
            </SearchFilterExport>
          )}
        </TableHeader>
        <div className="h-[60vh] overflow-y-auto scroll-smooth">{children}</div>
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
