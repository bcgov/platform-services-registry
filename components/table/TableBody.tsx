"use client";
import { useRouter, usePathname } from "next/navigation";
import path from "path";

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, any>[];
}

export default function TableBody({ headers, rows }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className="flow-root h-[700px] overflow-y-auto ">
        <div className="w-full overflow-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-left">
              <thead className="bg-tableheadergrey border-b-1">
                <tr>
                  {headers.map(({ headerName }, index) => (
                    <th
                      key={headerName + index}
                      scope="col"
                      className={`font-bcsans relative isolate py-3.5 text-left text-sm font-normal text-mediumgrey md:w-auto ${
                        index === 0 ? "pl-4 sm:pl-6 lg:pl-8" : "px-3"
                      } ${
                        index === headers.length - 1
                          ? "pr-4 sm:pr-6 lg:pr-8"
                          : ""
                      }`}
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
                    onClick={() =>
                      router.push(path.join(pathname, row.licencePlate))
                    }
                  >
                    {headers.map((value, index) => (
                      <td
                        key={value["field"] + index}
                        className={` px-3 py-4 text-sm text-mediumgrey md:table-cell border-b-1 ${
                          index === 0 ? "pl-4 sm:pl-6 lg:pl-8" : ""
                        } `}
                      >
                        {row[value["field"]]}
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
