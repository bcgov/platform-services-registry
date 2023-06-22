import Image from "next/image";
import Edit from "@/components/assets/edit.svg";

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, string>[];
}

export default function Table({ headers, rows }: TableProps) {
  const pageSize = rows.length;

  return (
    <>
      <div className="flow-root overflow-hidden">
        <div
          className="mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-auto"
          // style={{ maxHeight: "600px" }}
        >
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr>
                  <th
                    scope="col"
                    className="font-bcsans relative isolate py-3.5 pr-3 text-left text-sm font-normal text-mediumgrey md:w-auto"
                  >
                    {headers[0]["headerName"]}
                  </th>
                  {headers.slice(1, headers.length).map(({ headerName }) => (
                    <th
                      scope="col"
                      className="font-bcsans hidden px-3 py-3.5 text-left text-sm font-normal md:table-cell text-mediumgrey"
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
                {rows.map((row, i) => (
                  <tr key={row.licencePlate + i}>
                    <td className="relative py-4 pr-3 text-sm text-mediumgrey">
                      {row[headers[0]["field"]]}
                    </td>
                    {headers.slice(1, headers.length).map((value) => (
                      <td className="hidden px-3 py-4 text-sm text-mediumgrey md:table-cell">
                        {row[value["field"]]}
                      </td>
                    ))}
                    <td>
                      <div style={{ width: "16px", height: "12.5px" }}>
                        <Image
                          alt="Vercel logo"
                          src={Edit}
                          width={16}
                          height={12.5}
                        />
                      </div>
                    </td>
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
