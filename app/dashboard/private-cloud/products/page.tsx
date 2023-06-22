import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { PrivateCloudProject } from "@prisma/client";
import SearchFilterSort from "@/components/SearchFilterSort";
import { userPrivateCloudProjectsPaginated } from "@/queries/project";
import Link from "next/link";
import TableTop from "@/components/TableTop";

const headers = [
  { field: "name", headerName: "Name" },
  { field: "description", headerName: "Description" },
  { field: "ministry", headerName: "Ministry" },
  { field: "cluster", headerName: "Cluster" },
  { field: "projectOwner", headerName: "Project Owner" },
  { field: "technicalLeads", headerName: "Technical Leads" },
  { field: "created", headerName: "Created" },
  { field: "licencePlate", headerName: "Licence Plate" }
];

export default async function Page({
  params,
  searchParams
}: {
  params: { page: string; ministry: string; cluster: string };
  searchParams: { search: string; page: number; pageSize: number };
}) {
  const { search, page, pageSize } = searchParams;
  const { ministry, cluster } = params;

  const currentPage = typeof searchParams.page === "string" ? +page : 1;

  const projects = await userPrivateCloudProjectsPaginated(
    10,
    currentPage,
    search,
    ministry,
    cluster
  );

  const rows = projects.data.map((project: any) => {
    return {
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      cluster: project.cluster,
      projectOwner: `${project.projectOwnerDetails.firstName} ${project.projectOwnerDetails.lastName}`,
      technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName}, ${project.secondaryTechnicalLeadDetails.firstName} ${project.secondaryTechnicalLeadDetails.lastName}`,
      created: new Date(project.$date).toDateString(),
      licencePlate: project.licencePlate
    };
  });

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <TableTop
        title="Products in Private Cloud OpenShift Platform"
        description="These are your products hosted on Private Cloud OpenShift platform"
      />
      <div className="border-b-2 px-4 py-2 w-full">
        <SearchFilterSort />
      </div>
      <Table headers={headers} rows={rows} />
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-bold">{page || 1}</span> to{" "}
            <span className="font-bold">{pageSize || 10}</span> of{" "}
            <span className="font-bold">{projects.total}</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <Link
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            href={{
              pathname: "/dashboard/private-cloud/products",
              query: { page: currentPage - 1, pageSize: pageSize, search }
            }}
            passHref
          >
            <button disabled={currentPage === 1}>Previous</button>
          </Link>
          <Link
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            href={{
              pathname: "/dashboard/private-cloud/products",
              query: { page: currentPage + 1, pageSize: pageSize, search }
            }}
            passHref
          >
            <button disabled={currentPage * (pageSize || 10) >= projects.total}>
              Next
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
