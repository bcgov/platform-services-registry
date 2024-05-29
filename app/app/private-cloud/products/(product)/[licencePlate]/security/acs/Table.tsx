import _get from 'lodash-es/get';
import _isArray from 'lodash-es/isArray';
import _isFunction from 'lodash-es/isFunction';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { formatDateSimple } from '@/utils/date';

type Process<T> = ({
  value,
  field,
  headerName,
  type,
  row,
}: {
  value: any;
  field: string;
  headerName: string;
  type?: string;
  row: T;
}) => string;

export interface CellProcess<T> {
  value: any;
  field: string;
  headerName: string;
  type?: string;
  process?: Process<T>;
  row: T;
}

export interface Header<T> {
  field: string;
  headerName: string;
  process?: Process<T>;
  type?: string;
}

function processCell<T>({ value, field, headerName, type, process, row }: CellProcess<T>) {
  if (!value) return null;

  if (type === 'Date') {
    return formatDateSimple(value);
  }

  if (_isFunction(process)) {
    return process({ value, field, headerName, type, row });
  }

  return _isArray(value) ? value.join(', ') : value;
}

export default async function Table<T extends { id: string }>({
  title,
  linkHref,
  linkTitle,
  headers,
  data,
}: {
  title: string;
  linkHref?: string;
  linkTitle?: string;
  headers: Header<T>[];
  data: T[];
}) {
  return (
    <>
      <h4 className="flex justify-between mt-3 mb-1 mx-8">
        <span className="font-semibold text-xl">{title}</span>
        {linkHref && (
          <ExternalLink href={linkHref} className="text-sm leading-6">
            {linkTitle ?? linkHref}
          </ExternalLink>
        )}
      </h4>
      <div className="flow-root overflow-y-auto">
        <div className="w-full overflow-auto border-y-1">
          <div className="inline-block min-w-full align-middle max-h-[600px]">
            <table className="w-full text-left">
              <thead className="bg-tableheadergrey border-1">
                <tr>
                  {headers.map(({ headerName }, index) => (
                    <th
                      key={headerName + index}
                      scope="col"
                      className={`font-sans relative isolate py-3.5 text-left text-base font-semibold text-mediumgrey md:w-auto ${
                        index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : 'px-3'
                      } ${index === headers.length - 1 ? 'pr-4 sm:pr-6 lg:pr-8' : ''}`}
                    >
                      {headerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id} className="hover:bg-tableheadergrey">
                    {headers.map((value, index) => (
                      <td
                        key={value.field + index}
                        className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
                          index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
                        } `}
                      >
                        {processCell<T>({ ...value, value: _get(row, value.field), row })}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell pl-4 sm:pl-6 lg:pl-8"
                    >
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
