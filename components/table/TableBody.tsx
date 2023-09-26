"use client";

import { useRouter, usePathname } from "next/navigation";
import path from "path";
import Image from "next/image";
import Empty from "@/components/assets/empty.svg";
import Link from "next/link";

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, any>[];
}

function EmptyBody() {
  return (
    <div className="flex flex-col items-center justify-center h-[700px]">
      <Image
        alt="Empty"
        src={Empty}
        width={172}
        height={128}
        style={{
          maxWidth: "100%",
          height: "auto"
        }}
      />
      <span className="font-bcsans text-xl font-bold text-mediumgrey mt-4">
        There are no requests to be displayed
      </span>
      <span className="font-bcsans text-lg font-extralight text-mediumgrey mt-2">
        You currently have no provisioning requests for the
      </span>
      <span className="font-bcsans text-lg font-extralight text-mediumgrey">
        Private Cloud Openshift Platform
      </span>
      <Link
        className=" underline font-bcsans text-lg font-extralight text-linkblue mt-2"
        href="/private-cloud/products"
      >
        REQUEST A NEW PROJECT SET
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
                      router.push(
                        path.join(pathname as string, row.licencePlate)
                      )
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
