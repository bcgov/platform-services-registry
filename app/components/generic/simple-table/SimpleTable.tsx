import _get from 'lodash-es/get';
import _isString from 'lodash-es/isString';
import _startCase from 'lodash-es/startCase';
import { cn } from '@/utils/js';

export interface ColumnDefinition<TData> {
  label?: string | null;
  value: string;
  cellProcessor?: (item: TData, attribute: string) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<TData> {
  columns?: ColumnDefinition<TData>[];
  data: TData[];
  footer?: React.ReactNode;
  className?: string;
}

export default function SimpleTable<TData extends object>({
  columns: _columns,
  data,
  footer,
  className,
}: TableProps<TData>) {
  const getNestedValue = (obj: TData, path: string) => _get(obj, path);

  const columnDefs =
    _columns ||
    (data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          label: _startCase(key),
          value: key,
        }))
      : []);

  return (
    <div className={cn('border border-gray-200 overflow-hidden rounded-md', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {columnDefs.map((col) => (
                <th
                  key={col.value}
                  className={cn('text-left p-2 border-b border-gray-200 bg-gray-100', {
                    'text-left': col.align === 'left',
                    'text-right': col.align === 'right',
                    'text-center': col.align === 'center',
                  })}
                >
                  {_isString(col.label) ? col.label : _startCase(col.value)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columnDefs.map((col) => (
                    <td
                      key={col.value}
                      className={cn('p-2 border-b border-gray-200 align-center', {
                        'text-left': col.align === 'left',
                        'text-right': col.align === 'right',
                        'text-center': col.align === 'center',
                      })}
                    >
                      {col.cellProcessor ? col.cellProcessor(row, col.value) : getNestedValue(row, col.value)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnDefs.length} className="p-2 border-b border-gray-200 italic text-center">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  );
}
