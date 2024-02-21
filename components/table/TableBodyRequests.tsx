'use client';

import { usePathname, useRouter } from 'next/navigation';
import path from 'path';
import Image from 'next/image';
import Empty from '@/components/assets/empty.svg';
import Link from 'next/link';

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, any>[];
}

function EmptyBody() {
  const pathname = usePathname();

  if (!pathname) return null;
  return (
    <div className="flex flex-col items-center justify-center py-12 mt-12">
      <Image
        alt="Empty"
        src={Empty}
        width={172}
        height={128}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <span className="font-bcsans text-xl font-bold text-mediumgrey mt-4">There are no requests to be displayed</span>
      <Link
        className=" underline font-bcsans text-lg font-extralight text-linkblue mt-4"
        href={`/${pathname.split('/')[1]}/create`}
      >
        REQUEST A NEW PRODUCT
      </Link>
    </div>
  );
}

export default function TableBody({ headers, rows }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    if (pathname.includes('/private-cloud')) {
      router.push(path.join('/private-cloud', 'request', row.id));
    } else if (pathname.includes('/public-cloud')) {
      router.push(path.join('/public-cloud', 'request', row.id));
    }
  };

  return (
    <>
      <div className="flow-root overflow-y-auto h-[55vh]">
        <div className="w-full overflow-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-left">
              <thead className="bg-tableheadergrey border-b-1">
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
                  <tr
                    key={row.licencePlate + i}
                    className="hover:bg-tableheadergrey"
                    onClick={() => onRowClickHandler(row)}
                  >
                    {headers.map((value, index) => (
                      <td
                        key={value.field + index}
                        className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
                          index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
                        } `}
                      >
                        {row[value.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
