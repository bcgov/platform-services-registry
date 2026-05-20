import { Button } from '@mantine/core';
import { Table } from '@tanstack/react-table';

export default function Pagination<TData>({
  table,
  display = 'page',
}: {
  table: Table<TData>;
  display?: 'page' | 'results';
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="flex items-center gap-1">
        {display === 'results' ? (
          <strong>
            Showing {start} to {end} of {totalRows} results
          </strong>
        ) : (
          <>
            <div>Page</div>
            <strong>
              {pageIndex + 1} of {table.getPageCount()}
            </strong>
          </>
        )}
      </span>

      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="px-2 py-1 border rounded-sm min-w-20"
        >
          {[5, 10, 20, 30, 50, 100, 200].map((pageSize) => (
            <option key={pageSize} value={pageSize} className="min-w-[100px]">
              {pageSize}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          {[
            {
              text: 'First',
              action: () => table.setPageIndex(0),
              disabled: !table.getCanPreviousPage(),
            },
            {
              text: 'Previous',
              action: () => table.previousPage(),
              disabled: !table.getCanPreviousPage(),
            },
            {
              text: 'Next',
              action: () => table.nextPage(),
              disabled: !table.getCanNextPage(),
            },
            {
              text: 'Last',
              action: () => table.setPageIndex(table.getPageCount() - 1),
              disabled: !table.getCanNextPage(),
            },
          ].map((button) => (
            <Button
              key={button.text}
              variant="outline"
              size="sm"
              color="black"
              onClick={button.action}
              disabled={button.disabled}
              p="xs"
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
