import { Checkbox, UnstyledButton } from '@mantine/core';
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
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/js';
import Pagination from './Pagination';

export interface ColumnDefinition<TData> {
  label?: string | null;
  value: string;
  cellFormatter?: (item: TData, attribute: string) => React.ReactNode;
  sortValue?: (item: TData) => unknown;
  align?: 'left' | 'center' | 'right';
  width?: string;
  truncate?: boolean;
}

interface TableProps<TData> {
  columns?: ColumnDefinition<TData>[];
  data: TData[];
  defaultPageSize?: number;
  disablePagination?: boolean;
  footer?: React.ReactNode;
  paginationDisplay?: 'page' | 'results';
  getRowHref?: (item: TData) => string | null | undefined;
  selectableRows?: boolean;
  getRowId?: (item: TData) => string;
  selectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
}

export default function DataTable<TData extends object>({
  columns: _columns,
  data,
  defaultPageSize = 10,
  disablePagination = false,
  footer,
  paginationDisplay = 'page',
  getRowHref,
  selectableRows = false,
  getRowId,
  selectedRowIds,
  onSelectedRowIdsChange,
}: TableProps<TData>) {
  const router = useRouter();
  const columnHelper = createColumnHelper<TData>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: disablePagination ? data.length : defaultPageSize,
  });
  const selectedIdSet = useMemo(() => new Set(selectedRowIds ?? []), [selectedRowIds]);
  const canSelectRows = selectableRows && !!getRowId && !!onSelectedRowIdsChange;

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
      return columnHelper.accessor((row) => (col.sortValue ? col.sortValue(row) : _get(row, col.value)), {
        id: col.value,
        header: ({ column }) => {
          const label = _isString(col.label) ? col.label : _startCase(col.value);

          return (
            <UnstyledButton
              className={cn('w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap', {
                'text-left': col.align === 'left',
                'text-right': col.align === 'right',
                'text-center': col.align === 'center',
              })}
              style={col.width ? { width: col.width } : undefined}
              onClick={() => column.toggleSorting()}
              title={label ?? undefined}
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
        cell: (info: CellContext<TData, TData>) => {
          const rawValue = _get(info.row.original, col.value);
          const displayValue = col.cellFormatter
            ? col.cellFormatter(info.row.original, col.value)
            : String(info.getValue());
          const title = typeof rawValue === 'string' || typeof rawValue === 'number' ? String(rawValue) : undefined;

          return (
            <div
              className={cn('min-w-0', {
                'overflow-hidden text-ellipsis whitespace-nowrap': col.truncate !== false,
                'text-left': col.align === 'left',
                'text-right': col.align === 'right',
                'text-center': col.align === 'center',
              })}
              style={col.width ? { width: col.width, maxWidth: col.width } : undefined}
              title={title}
            >
              {displayValue}
            </div>
          );
        },
      });
    });
  }, [_columns, data, columnHelper]);
  const columnWidthsById = useMemo(
    () => new Map((_columns ?? []).map((column) => [column.value, column.width])),
    [_columns],
  );

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

  const visibleRowIds = useMemo(
    () => (canSelectRows && getRowId ? table.getRowModel().rows.map((row) => getRowId(row.original)) : []),
    [canSelectRows, getRowId, table],
  );
  const visibleRowCount = table.getRowModel().rows.length;
  const placeholderRowCount =
    !disablePagination && data.length > 0 ? Math.max(table.getState().pagination.pageSize - visibleRowCount, 0) : 0;
  const columnCount = columnDefs.length + (canSelectRows ? 1 : 0);
  const allVisibleSelected = visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedIdSet.has(id));
  const someVisibleSelected = visibleRowIds.some((id) => selectedIdSet.has(id));

  const toggleAllVisibleRows = (checked: boolean) => {
    if (!getRowId || !onSelectedRowIdsChange) return;
    const next = new Set(selectedIdSet);
    for (const id of visibleRowIds) {
      if (checked) next.add(id);
      else next.delete(id);
    }
    onSelectedRowIdsChange(Array.from(next));
  };

  const toggleSingleRow = (id: string, checked: boolean) => {
    if (!onSelectedRowIdsChange) return;
    const next = new Set(selectedIdSet);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedRowIdsChange(Array.from(next));
  };

  return (
    <>
      <div className="border border-gray-200 overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-fixed border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {canSelectRows && (
                    <th
                      className="text-left p-2 border-b border-gray-200 bg-gray-100 w-10"
                      key={`${headerGroup.id}-select`}
                    >
                      <Checkbox
                        checked={allVisibleSelected}
                        indeterminate={!allVisibleSelected && someVisibleSelected}
                        onChange={(event) => toggleAllVisibleRows(event.currentTarget.checked)}
                        aria-label="Select all visible rows"
                      />
                    </th>
                  )}
                  {headerGroup.headers.map((header) => (
                    <th
                      className="text-left p-2 border-b border-gray-200 bg-gray-100"
                      key={header.id}
                      style={
                        columnWidthsById.get(header.column.id)
                          ? { width: columnWidthsById.get(header.column.id) }
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const rowSelectionId = getRowId?.(row.original);
                  const isSelected = rowSelectionId ? selectedIdSet.has(rowSelectionId) : false;
                  const href = getRowHref?.(row.original);

                  return (
                    <tr
                      key={row.id}
                      className={cn('bg-white even:bg-gray-50 transition-colors', {
                        'cursor-pointer hover:bg-slate-50 focus-within:bg-slate-50': !!href && !isSelected,
                        'bg-blue-50 even:bg-blue-50 hover:bg-blue-100 focus-within:bg-blue-100': isSelected,
                      })}
                      onClick={() => {
                        if (href) router.push(href);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        if (!href) return;
                        event.preventDefault();
                        router.push(href);
                      }}
                      tabIndex={href ? 0 : undefined}
                    >
                      {canSelectRows && rowSelectionId && (
                        <td className="h-12 p-2 border-b border-gray-200 align-middle w-10">
                          <Checkbox
                            checked={selectedIdSet.has(rowSelectionId)}
                            onChange={(event) => toggleSingleRow(rowSelectionId, event.currentTarget.checked)}
                            onClick={(event) => event.stopPropagation()}
                            aria-label="Select row"
                          />
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="h-12 p-2 border-b border-gray-200 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columnCount} className="h-12 p-2 border-b border-gray-200 italic text-center">
                    No data available.
                  </td>
                </tr>
              )}
              {placeholderRowCount > 0 &&
                Array.from({ length: placeholderRowCount }).map((_, index) => (
                  <tr key={`placeholder-${index}`} className="bg-white even:bg-gray-50">
                    <td colSpan={columnCount} className="h-12 border-b border-gray-200">
                      <span className="invisible">placeholder</span>
                    </td>
                  </tr>
                ))}
            </tbody>
            {footer && <tfoot>{footer}</tfoot>}
          </table>
        </div>
      </div>
      {data.length > 0 && !disablePagination && <Pagination table={table} display={paginationDisplay} />}
    </>
  );
}
