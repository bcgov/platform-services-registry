import Table from "@/components/table/Table";
import SearchFilterSort from "@/components/table/SearchFilterSort";
import { userPrivateCloudProjectsPaginated } from "@/queries/project";
import TableTop from "@/components/table/TableTop";
import formatDate from "@/components/utils/formatdates";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";
import PagninationButtons from "@/components/buttons/PaginationButtons";
import { Suspense } from "react";

const headers = [
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

  const currentPage = typeof searchParams.page === "string" ? +page : 1;
  const defaultPageSize = 10;

  const { data, total } = await userPrivateCloudProjectsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );

  const rows = data.map((project: any) => {
    return {
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      cluster: project.cluster,
      projectOwner: `${project.projectOwnerDetails.firstName} ${project.projectOwnerDetails.lastName}`,
      technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName}, ${project.secondaryTechnicalLeadDetails.firstName} ${project.secondaryTechnicalLeadDetails.lastName}`,
      created: formatDate(project.created["$date"]),
      licencePlate: project.licencePlate,
      edit: (
        <div
          className="pr-4 sm:pr-6 lg:pr-8
        >"
        >
          <div
            className=" w-4 h-3 "
            // pr-4 sm:pr-6 lg:pr-8
          >
            <Image alt="Edit icon" src={Edit} width={16} height={12.5} />
          </div>
        </div>
      ),
    };
  });

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
        <Table headers={headers} rows={rows} />
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
