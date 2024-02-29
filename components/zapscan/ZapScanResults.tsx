import { Prisma } from '@prisma/client';
import TableTop from '@/components/table/TableTop';
import PagninationButtons from '@/components/buttons/PaginationButtons';
import formatDate from '@/components/utils/formatdates';
import SearchPanel from './SearchPanel';

type ZapResultRows = Prisma.PrivateCloudProjectZapResultGetPayload<{
  select: { id: true; licencePlate: true; cluster: true; host: true; json: true; scannedAt: true; available: true };
}>;

const processCell = (value: any, field: string, headerName: string, row: ZapResultRows) => {
  if (!value) return null;

  if (field === 'scannedAt') {
    return formatDate(value);
  }

  if (headerName === 'Total') {
    if (!row.available) return '-';
    return value.site[0].alerts.length;
  }

  if (headerName === 'Alerts') {
    if (!row.available) return '-';

    const meta = {
      info: 0,
      low: 0,
      med: 0,
      high: 0,
      total: 0,
    };

    value.site[0].alerts.forEach((alert: { riskcode: string }) => {
      switch (alert.riskcode) {
        case '0':
          meta.info += 1;
          break;
        case '1':
          meta.low += 1;
          break;
        case '2':
          meta.med += 1;
          break;
        case '3':
          meta.high += 1;
          break;
        default:
          break;
      }

      meta.total += 1;
    });

    return (
      <div className="relative min-w-[80px]">
        <div className="overflow-hidden h-full flex rounded-sm">
          <div
            style={{ width: `${(meta.info / meta.total) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            title="Informational"
          >
            {meta.info}
          </div>
          <div
            style={{ width: `${(meta.low / meta.total) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
            title="Low"
          >
            {meta.low}
          </div>
          <div
            style={{ width: `${(meta.med / meta.total) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
            title="Medium"
          >
            {meta.med}
          </div>
          <div
            style={{ width: `${(meta.high / meta.total) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            title="High"
          >
            {meta.high}
          </div>
        </div>
      </div>
    );
  }

  if (field === 'id') {
    if (!row.available) return 'Not Available';

    return (
      <a className="underline text-blue-500" href={`/zapscan/reports/${value}`} target="_blank" rel="noreferrer">
        Report
      </a>
    );
  }

  if (field === 'host') {
    return (
      <a className="underline text-blue-500" href={`https://${value}`} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }

  return value;
};

export default async function ZapScanResults({
  rows,
  clusters,
  total,
  page,
  skip,
  take,
  listAll = false,
}: {
  rows: ZapResultRows[];
  clusters: string[];
  total: number;
  page: number;
  skip: number;
  take: number;
  listAll?: boolean;
}) {
  const headers = [
    { field: 'host', headerName: 'Host' },
    { field: 'json', headerName: 'Alerts' },
    { field: 'json', headerName: 'Total' },
    { field: 'scannedAt', headerName: 'Scanned At' },
    { field: 'id', headerName: '' },
  ];

  if (listAll) {
    headers.unshift(
      { field: 'cluster', headerName: 'Cluster' },
      { field: 'licencePlate', headerName: 'Licence Plate' },
    );
  }

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div>
        <TableTop title="Zap Scan Results" description="" />
        <SearchPanel clusters={clusters} endPaths={listAll ? '/zapscan/results' : '/zapscan'} />
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
                  {rows.map((row, i) => (
                    <tr key={row.id} className="hover:bg-tableheadergrey">
                      {headers.map((value, index) => (
                        <td
                          key={value.field + index}
                          className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
                            index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
                          } `}
                        >
                          {processCell(
                            row[value.field as 'cluster' | 'licencePlate' | 'host' | 'scannedAt'],
                            value.field,
                            value.headerName,
                            row,
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
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
