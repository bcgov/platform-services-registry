import { UnstyledButton } from '@mantine/core';
import { IconArrowDown, IconArrowsSort, IconArrowUp } from '@tabler/icons-react';
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import _get from 'lodash-es/get';
import _isString from 'lodash-es/isString';
import _startCase from 'lodash-es/startCase';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/js';
import Pagination from './Pagination';

export interface ColumnDefinition<TData> {
  label?: string | null;
  value: string;
  cellFormatter?: (item: TData, attribute: string) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<TData> {
  columns?: ColumnDefinition<TData>[];
  data: TData[];
  defaultPageSize?: number;
  disablePagination?: boolean;
  footer?: React.ReactNode;
}

export default function DataTable<TData extends object>({
  columns: _columns,
  data,
  defaultPageSize = 10,
  disablePagination = false,
  footer,
}: TableProps<TData>) {
  const columnHelper = createColumnHelper<TData>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: disablePagination ? data.length : defaultPageSize,
  });

  // Resolve nested paths (e.g., "dayDetails.cpuCostsToDate")
  const getNestedValue = (obj: TData, path: string) => _get(obj, path);

  useEffect(() => {
    setPagination(() => ({
      pageIndex: 0,
      pageSize: disablePagination ? data.length : defaultPageSize,
    }));
  }, [disablePagination, data.length, defaultPageSize]);

  const columnDefs = useMemo(() => {
    const cols =
      _columns ||
      (data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            label: _startCase(key),
            value: key,
          }))
        : []);

    return cols.map((col: ColumnDefinition<TData>) => {
      return columnHelper.accessor((row) => getNestedValue(row, col.value), {
        id: col.value,
        header: ({ column }) => {
          const label = _isString(col.label) ? col.label : _startCase(col.value);

          return (
            <UnstyledButton
              className={cn('w-full cursor-pointer', {
                'text-left': col.align === 'left',
                'text-right': col.align === 'right',
                'text-center': col.align === 'center',
              })}
              onClick={() => column.toggleSorting()}
            >
              {label}
              {label && (
                <div className="ml-2 inline-block h-4">
                  {column.getIsSorted() === 'asc' ? (
                    <IconArrowUp className="h-5 w-5 stroke-2 text-black dark:text-black" />
                  ) : column.getIsSorted() === 'desc' ? (
                    <IconArrowDown className="h-5 w-5 stroke-2 text-black dark:text-black" />
                  ) : (
                    <IconArrowsSort className="h-5 w-5 stroke-2 text-gray-300 dark:text-gray-300" />
                  )}
                </div>
              )}
            </UnstyledButton>
          );
        },
        cell: (info: CellContext<TData, TData>) => (
          <div
            className={cn({
              'text-left': col.align === 'left',
              'text-right': col.align === 'right',
              'text-center': col.align === 'center',
            })}
          >
            {col.cellFormatter ? col.cellFormatter(info.row.original, col.value) : String(info.getValue())}
          </div>
        ),
      });
    });
  }, [_columns, data, columnHelper]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <>
      <div className="border border-gray-200 overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th className="text-left p-2 border-b border-gray-200 bg-gray-100" key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="bg-white even:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2 border-b border-gray-200 align-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-2 border-b border-gray-200 italic text-center">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
            {footer && <tfoot>{footer}</tfoot>}
          </table>
        </div>
      </div>
      {data.length > 0 && !disablePagination && <Pagination table={table} />}
    </>
  );
}
