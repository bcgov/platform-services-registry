'use client';

import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import TableTop from '@/components/table/TableTop';
import PagninationButtons from '@/components/buttons/PaginationButtons';
import formatDate from '@/utils/date';
import SearchPanel from './SearchPanel';
import ExternalLink from '@/components/generic/button/ExternalLink';

type SonarScanResultRows = Prisma.SonarScanResultGetPayload<{
  select: {
    id: true;
    context: true;
    clusterOrProvider: true;
    licencePlate: true;
    url: true;
    sha: true;
    source: true;
    result: true;
    scannedAt: true;
  };
}>;

const processCell = (value: any, field: string, headerName: string, row: SonarScanResultRows) => {
  if (!value) return null;

  if (field === 'scannedAt') {
    return formatDate(value);
  }

  if (['bugs', 'codeSmells', 'vulnerabilities', 'securityRating', 'coverage', 'duplications'].includes(field)) {
    if (value === 'null') return '';

    const tryNum = Number(value);
    return <div className="">{_isNumber(tryNum) ? tryNum.toLocaleString() : value}</div>;
  }

  if (field === 'url') {
    return (
      <div>
        <ExternalLink href={value}>{value}</ExternalLink>
        {row.source === 'ACS' && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded no-underline ml-1">
            ACS
          </span>
        )}
      </div>
    );
  }

  return value;
};

export default function SonarScanResults({
  rows,
  contexts,
  total,
  page,
  skip,
  take,
  listAll = false,
}: {
  rows: SonarScanResultRows[];
  contexts: string[];
  total: number;
  page: number;
  skip: number;
  take: number;
  listAll?: boolean;
}) {
  const data = rows.map((row) => {
    return {
      ...row,
      bugs: row.result.bugs,
      codeSmells: row.result.code_smells,
      vulnerabilities: row.result.vulnerabilities,
      securityRating: row.result.security_rating,
      coverage: row.result.coverage,
      duplications: row.result.duplicated_lines_density,
    };
  });

  const headers = [
    { field: 'url', headerName: 'Repository URL' },
    { field: 'bugs', headerName: 'Bugs' },
    { field: 'codeSmells', headerName: 'Code Smells' },
    { field: 'vulnerabilities', headerName: 'Vulnerabilities' },
    { field: 'securityRating', headerName: 'Security Hotspots' },
    { field: 'coverage', headerName: 'Coverage' },
    { field: 'duplications', headerName: 'Duplications' },
    { field: 'scannedAt', headerName: 'Scanned At' },
  ];

  if (listAll) {
    headers.unshift(
      { field: 'context', headerName: 'Context' },
      { field: 'licencePlate', headerName: 'Licence Plate' },
    );
  }

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div>
        <TableTop title="SonarScan Results" description="" />
        <SearchPanel contexts={contexts} endPaths={listAll ? '/sonarscan/results' : '/sonarscan'} />
        <div className="flow-root overflow-y-auto h-[55vh]">
          <div className="w-full overflow-auto">
            <div className="inline-block min-w-full align-middle">
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
                          {processCell(row[value.field as never], value.field, value.headerName, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td
                        colSpan={headers.length}
                        className="font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell"
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
      </div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          {total === 0 ? (
            <p className="text-sm text-gray-700">Showing 0 to 0 of 0 results</p>
          ) : total < take * page ? (
            <p className="text-sm text-gray-700">
              Showing <span>{take * (page - 1) + 1}</span> to <span>{total}</span> of <span>{total}</span> results
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Showing <span>{take * (page - 1) + 1}</span> to <span>{take * page}</span> of <span>{total}</span> results
            </p>
          )}
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div>
            <PagninationButtons pageCount={total / take} page={page} pageSize={take} />
          </div>
        </div>
      </nav>
    </div>
  );
}
