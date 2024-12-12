'use client';

import { IconChevronRight } from '@tabler/icons-react';
import _isBoolean from 'lodash-es/isBoolean';
import _isString from 'lodash-es/isString';
import _startCase from 'lodash-es/startCase';
import { DiffChange } from '@/utils/js';

const abbreviations = ['cpu'];

function ProductField({ path, iconSize = 18 }: { path: (string | number)[]; iconSize?: number }) {
  return path.map((val, index) => {
    const str = val.toString();
    const formatted = abbreviations.includes(str.toLowerCase()) ? str.toUpperCase() : _startCase(str);

    return (
      <span key={formatted}>
        {index > 0 && <IconChevronRight size={iconSize} className="inline-block mx-1" />}
        <span>{formatted}</span>
      </span>
    );
  });
}

function ProductValue({ value, formatterKey }: { value: any; formatterKey?: string }) {
  if (_isString(value)) return <span>{value}</span>;
  if (_isBoolean(value)) return <span>{value ? 'Yes' : 'No'}</span>;
  if (Array.isArray(value)) return value.join(', ');
  return <span>{String(value)}</span>;
}

export default function ProductComparison({ data }: { data?: DiffChange[] }) {
  if (!data) return null;

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Field
            </th>
            <th scope="col" className="px-6 py-3">
              Old Value
            </th>
            <th scope="col" className="px-6 py-3">
              New Value
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((change, index) => {
              return (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">
                    <ProductField path={change.path} />
                  </td>
                  <td className="px-6 py-4">
                    <ProductValue value={change.oldVal} formatterKey={change.tag} />
                  </td>
                  <td className="px-6 py-4">
                    <ProductValue value={change.newVal} formatterKey={change.tag} />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4" colSpan={3}>
                No differences found between the two datasets.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
