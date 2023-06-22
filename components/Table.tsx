import Image from "next/image";
import Edit from "@/components/assets/edit.svg";
import { Suspense } from "react";

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, string>[];
}

export default function Table({ headers, rows }: TableProps) {
  const pageSize = rows.length;

  return (
    <>
      <div className="mt-8 flow-root overflow-hidden">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="font-bcsans relative isolate py-3.5 pr-3 text-left text-sm font-normal text-mediumgrey w-full md:w-auto"
                >
                  {headers[0]["headerName"]}
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                {headers.slice(1, headers.length).map(({ headerName }) => (
                  <th
                    scope="col"
                    className="font-bcsans hidden px-3 py-3.5 text-left text-sm font-normal md:table-cell  text-mediumgrey"
                  >
                    {headerName}
                  </th>
                ))}
                <th scope="col" className="relative py-3.5 pl-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <Suspense fallback={<div>Loading...</div>}>
                {rows.map((row, i) => (
                  <tr key={row.licencePlate + i}>
                    <td className="relative py-4 pr-3 text-sm  text-mediumgrey">
                      {row[headers[0]["field"]]}
                      <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                      <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                    </td>
                    {headers.slice(1, headers.length).map((value) => (
                      <td className="hidden px-3 py-4 text-sm text-mediumgrey md:table-cell">
                        {row[value["field"]]}
                      </td>
                    ))}
                    <td>
                      <Image
                        alt="Vercel logo"
                        src={Edit}
                        width={16}
                        height={12.5}
                      />
                    </td>
                  </tr>
                ))}
              </Suspense>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
