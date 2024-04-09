'use client';

import SearchFilterSort from '@/components/table/SearchFilterSort';
import TableTop from '@/components/table/TableTop';
import PagninationButtons from '@/components/buttons/PaginationButtons';
import { Suspense } from 'react';
export default function Table({
  title,
  description,
  currentPage,
  pageSize,
  total,
  tableBody,
  showDownloadButton,
  apiContext,
  removeSearch = false,
}: {
  title: string;
  description: string;
  currentPage: number;
  pageSize: number;
  total: number;
  tableBody: React.ReactNode;
  showDownloadButton?: boolean;
  apiContext?: string;
  removeSearch?: boolean;
}) {
  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div>
        <TableTop title={title} description={description} />
        <div className="flex justify-between items-center border-b-2 px-4 py-2 w-full">
          <Suspense>
            <SearchFilterSort
              showDownloadButton={showDownloadButton}
              apiContext={apiContext}
              removeSearch={removeSearch}
            />
          </Suspense>
        </div>
        <div className="h-[60vh] overflow-y-auto scroll-smooth">{tableBody}</div>
      </div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          {total == 0 ? (
            <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
          ) : total < pageSize * currentPage ? (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (currentPage - 1) + 1}</span> to <span>{total}</span> of <span>{total}</span>{' '}
              results
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (currentPage - 1) + 1}</span> to <span>{pageSize * currentPage}</span> of{' '}
              <span>{total}</span> results
            </p>
          )}
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div>
            <Suspense>
              <PagninationButtons pageCount={total / pageSize} page={currentPage} pageSize={pageSize} />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  );
}
