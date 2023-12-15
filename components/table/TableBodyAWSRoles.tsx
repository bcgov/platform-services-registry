'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const headers = [
  { field: 'role', headerName: 'Role' },
  { field: 'firstName', headerName: 'First Name' },
  { field: 'lastName', headerName: 'Last Name' },
];

const rows: Record<string, any>[] = [
  {
    id: '1111',
    createdTimestamp: 1699473638027,
    firstName: 'Krishna',
    lastName: 'Nyshadham',
    email: 'krinysha@amazon.com',
  },
];
//rows : Record<string, any>[]
export default function TableBodyAWSRoles() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const onRowClickHandler = (row: any) => {
    console.log(pathname);
  };
  const subHeader = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
  ];
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
                  <tr key={row.id} className="hover:bg-tableheadergrey" onClick={() => onRowClickHandler(row)}>
                    <td
                      key={i}
                      className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
                        i === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
                      } `}
                    >
                      admin
                    </td>
                    {subHeader.map((value, index) => (
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
