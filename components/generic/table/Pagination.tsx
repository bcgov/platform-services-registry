'use client';

import { useTableState } from './Table';

export default function Pagination() {
  const { state, snapshot: snap } = useTableState();

  const pageCount = snap.totalCount / snap.pageSize;
  const isPrevDisabled = snap.page === 1;
  const isNextDisabled = snap.page >= pageCount;

  const handlePaginationUpdate = (newPage: number, newPageSize?: number) => {
    state.page = newPage;
    state.pageSize = newPageSize ?? snap.pageSize;
    snap.onPagination(state.page, state.pageSize);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="">
        {snap.totalCount == 0 ? (
          <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
        ) : snap.totalCount < snap.pageSize * snap.page ? (
          <p className="text-sm text-gray-700">
            Showing <span>{snap.pageSize * (snap.page - 1) + 1}</span> to <span>{snap.totalCount}</span> of{' '}
            <span>{snap.totalCount}</span> results
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Showing <span>{snap.pageSize * (snap.page - 1) + 1}</span> to <span>{snap.pageSize * snap.page}</span> of{' '}
            <span>{snap.totalCount}</span> results
          </p>
        )}
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <span>Rows per page: </span>
        <select
          id="pageSize"
          name="pageSize"
          value={snap.pageSize}
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
        <button
          className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isPrevDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
          onClick={() => handlePaginationUpdate(snap.page - 1)}
          disabled={isPrevDisabled}
        >
          Previous
        </button>
        <button
          className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isNextDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
          onClick={() => handlePaginationUpdate(snap.page + 1)}
          disabled={isNextDisabled}
        >
          Next
        </button>
      </div>
    </div>
  );
}
