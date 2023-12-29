'use client';

import { usePathname } from 'next/navigation';

const headers = [
  { field: 'role', headerName: 'Role' },
  { field: 'firstName', headerName: 'First Name' },
  { field: 'lastName', headerName: 'Last Name' },
  { field: 'email', headerName: 'Email' },
];

interface TableProps {
  rows: Record<string, any>[];
}

export default function TableBodyAWSRoles({ rows }: TableProps) {
  const pathname = usePathname();

  const onRowClickHandler = (row: any) => {
    console.log(pathname);
  };
  const subHeader = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
    { field: 'email', headerName: 'Email' },
  ];

  return (
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
                    className={`font-sans font-normal text-base pl-4 sm:pl-6 lg:pl-8 py-4 text-mediumgrey md:table-cell border-b-1`}
                  >
                    {Object.keys(row)[0]}
                  </td>
                  {subHeader.map((value, index) => (
                    <td
                      key={index + i}
                      className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
                        index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
                      } `}
                    >
                      {row[Object.keys(row)[0]][value.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
