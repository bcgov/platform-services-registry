'use client';

import LightButton from '../button/LightButton';

interface Props {
  page: number;
  pageSize: number;
  totalCount: number;
  onPagination: (page: number, pageSize: number) => void;
  isLoading?: boolean;
}

export default function Pagination({ page, pageSize, totalCount, onPagination, isLoading = false }: Props) {
  const pageCount = totalCount / pageSize;
  const isPrevDisabled = page === 1;
  const isNextDisabled = page >= pageCount;

  const handlePaginationUpdate = (newPage: number, newPageSize?: number) => {
    onPagination(newPage, newPageSize ?? pageSize);
  };

  return (
    <div className="block md:flex md:items-center md:justify-between">
      {isLoading ? (
        <div></div>
      ) : (
        <div className="">
          {totalCount == 0 ? (
            <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
          ) : totalCount < pageSize * page ? (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (page - 1) + 1}</span> to <span>{totalCount}</span> of <span>{totalCount}</span>{' '}
              results
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Showing <span>{pageSize * (page - 1) + 1}</span> to <span>{pageSize * page}</span> of{' '}
              <span>{totalCount}</span> results
            </p>
          )}
        </div>
      )}
      <div className="flex flex-1 mt-1 md:mt-0 md:justify-end">
        <span className="mr-1">Rows per page: </span>
        <select
          id="pageSize"
          name="pageSize"
          value={pageSize}
          className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(e) => handlePaginationUpdate(1, Number(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <LightButton disabled={isPrevDisabled} onClick={() => handlePaginationUpdate(page - 1)} className="mx-2">
          Previous
        </LightButton>
        <LightButton disabled={isNextDisabled} onClick={() => handlePaginationUpdate(page + 1)}>
          Next
        </LightButton>
      </div>
    </div>
  );
}
