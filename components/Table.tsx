import SearchFilterSort from "@/components/SearchFilterSort";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";

interface TableProps {
  headers: string[];
  rows: Record<string, string>[];
}

export default function Table({ headers, rows }: TableProps) {
  return (
    <div className="border-2 rounded-xl">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 border-b-2">
        <div className="sm:flex sm:items-center pb-5">
          <div className="sm:flex-auto ">
            <h1 className="text-lg font-bcsans font-bold leading-6 text-gray-900">
              Products in Private Cloud OpenShift Platform
            </h1>
            <p className="mt-2 text-sm font-bcsans text-gray-700">
              These are your products hosted on Private Cloud OpenShift platform
            </p>
          </div>
        </div>
      </div>
      <div className="border-b-2 px-4 py-2 w-full">
        <SearchFilterSort />
      </div>

      <div className="mt-8 flow-root overflow-hidden">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="font-bcsans relative isolate py-3.5 pr-3 text-left text-sm font-normal text-mediumgrey"
                >
                  {headers[0]}
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                {headers.slice(1, headers.length).map((header) => (
                  <th
                    scope="col"
                    className="font-bcsans hidden px-3 py-3.5 text-left text-sm font-normal  sm:table-cell text-mediumgrey"
                  >
                    {header}
                  </th>
                ))}
                <th scope="col" className="relative py-3.5 pl-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.email}>
                  <td className="relative py-4 pr-3 text-sm font-medium text-mediumgrey">
                    {row.name}
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="hidden px-3 py-4 text-sm  sm:table-cell text-mediumgrey">
                    {row.description}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-mediumgrey md:table-cell ">
                    {row.email}
                  </td>
                  <td className="px-3 py-4 text-sm text-mediumgrey">
                    {row.role}
                  </td>
                  <td className="relative py-4 pl-3 text-right text-sm font-medium">
                    <Image
                      alt="Vercel logo"
                      src={Edit}
                      width={16}
                      height={12.5}
                      style={{
                        maxWidth: "100%",
                        height: "auto"
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
