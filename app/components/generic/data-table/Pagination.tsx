import { Button } from '@mantine/core';
import { Table } from '@tanstack/react-table';

export default function Pagination<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>

      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="px-2 py-1 border rounded min-w-20"
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
