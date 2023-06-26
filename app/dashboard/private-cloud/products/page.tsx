import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { PrivateCloudProject } from "@prisma/client";
import SearchFilterSort from "@/components/SearchFilterSort";
import { userPrivateCloudProjectsPaginated } from "@/queries/project";
import Link from "next/link";
import TableTop from "@/components/TableTop";
import formatDate from "@/components/utils/formatdates";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";
import PagninationButtons from "@/components/PaginationButtons";
import NavButton from "@/components/NavButton";

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
  params: { page: number; ministry: string; cluster: string };
  searchParams: { search: string; page: number; pageSize: number };
}) {
  const { search, page, pageSize } = searchParams;
  const { ministry, cluster } = params;

  const currentPage = typeof searchParams.page === "string" ? +page : 1;

  const { data, total } = await userPrivateCloudProjectsPaginated(
    10,
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

  const defaultPageSize = 10;
  const defaultPage = 1;

  const disablePrevious = currentPage <= 1;
  const disableNext = currentPage * (pageSize || defaultPageSize) >= total;

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <div className="">
        <TableTop
          title="Products in Private Cloud OpenShift Platform"
          description="These are your products hosted on Private Cloud OpenShift platform"
        />
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
            <span className="font-bold">
              {(pageSize || defaultPageSize) * (page - 1)}
            </span>{" "}
            to <span className="font-bold">{pageSize || defaultPageSize}</span>{" "}
            of <span className="font-bold">{total}</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <div
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${
              disableNext
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0"
            }`}
          >
            <PagninationButtons
              pageCount={total}
              page={currentPage}
              pageSize={10}
            />
            {/* <Link
              href={{
                pathname: "/dashboard/private-cloud/products",
                query: {
                  page: currentPage - 1,
                  pageSize: pageSize || defaultPageSize,
                  search,
                },
              }}
            >
              Previous
            </Link>
          </div>
          <div
            className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${
              disableNext
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0"
            }`}
          >
            <Link
              href={{
                pathname: "/dashboard/private-cloud/products",
                query: {
                  page: currentPage + 1,
                  pageSize: pageSize || defaultPageSize,
                  search,
                },
              }}
            >
              Next
            </Link> */}
          </div>
        </div>
      </nav>
    </div>
  );
}
