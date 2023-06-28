import Table from "@/components/table/Table";
import SearchFilterSort from "@/components/table/SearchFilterSort";
import { getProjectsPaginated } from "@/queries/project";
import TableTop from "@/components/table/TableTop";
import {
  privateCloudDataToRow,
  publicCloudDataToRow,
} from "@/helpers/rowMapper";

import PagninationButtons from "@/components/buttons/PaginationButtons";

const privateCloudHeaders = [
  { field: "name", headerName: "Name" },
  { field: "description", headerName: "Description" },
  { field: "ministry", headerName: "Ministry" },
  { field: "cluster", headerName: "Cluster" },
  { field: "projectOwner", headerName: "Project Owner" },
  { field: "technicalLeads", headerName: "Technical Leads" },
  { field: "created", headerName: "Created" },
  { field: "licencePlate", headerName: "Licence Plate" },
  { field: "edit", headerName: "" },
];

const publicCloudHeaders = [
  { field: "name", headerName: "Name" },
  { field: "csp", headerName: "csp" },
  { field: "description", headerName: "Description" },
  { field: "ministry", headerName: "Ministry" },
  { field: "projectOwner", headerName: "Project Owner" },
  { field: "technicalLeads", headerName: "Technical Leads" },
  { field: "created", headerName: "Created" },
  { field: "licencePlate", headerName: "Licence Plate" },
  { field: "edit", headerName: "" },
];

export default async function Page({
  params,
  searchParams,
}: {
  params: { cloud: string };
  searchParams: {
    search: string;
    page: number;
    pageSize: number;
    ministry: string;
    cluster: string;
  };
}) {
  const { search, page, pageSize, ministry, cluster } = searchParams;
  const { cloud } = params;

  const currentPage = typeof searchParams.page === "string" ? +page : 1;
  const defaultPageSize = 10;

  const { data, total } = await getProjectsPaginated(
    cloud,
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );

  let rows: any = [];

  if (cloud === "private-cloud") {
    rows = data.map(privateCloudDataToRow);
  } else if (cloud === "public-cloud") {
    rows = data.map(publicCloudDataToRow);
  }

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div className="">
        <TableTop
          title="Products in Private Cloud OpenShift Platform"
          description="These are your products hosted on Private Cloud OpenShift platform"
        />
        {/* <TableTop
            title="Products in the Public Cloud Landing Zones"
            description="These are your products hosted using the Public Cloud Landing Zones"
          /> */}
        <div className="border-b-2 px-4 py-2 w-full">
          <SearchFilterSort />
        </div>
        <Table
          headers={
            cloud === "private-cloud" ? privateCloudHeaders : publicCloudHeaders
          }
          rows={rows}
        />
      </div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span>{(pageSize || defaultPageSize) * (currentPage - 1)}</span> to{" "}
            <span>{(pageSize || defaultPageSize) * currentPage}</span> of{" "}
            <span>{total}</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div>
            <PagninationButtons
              pageCount={total / (pageSize || defaultPageSize)}
              page={currentPage}
              pageSize={defaultPageSize}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}
