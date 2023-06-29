import Table from "@/components/table/Table";
import { privateCloudRequestsPaginated } from "@/queries/project";
import { privateCloudRequestDataToRow } from "@/helpers/rowMapper";
import prisma from "@/lib/prisma";

const headers = [
  { field: "type", headerName: "Type" },
  { field: "name", headerName: "Name" },
  { field: "ministry", headerName: "Ministry" },
  { field: "cluster", headerName: "Cluster" },
  { field: "projectOwner", headerName: "Project Owner" },
  { field: "technicalLeads", headerName: "Technical Leads" },
  { field: "created", headerName: "Created" },
  { field: "licencePlate", headerName: "Licence Plate" },
];

export default async function Page({
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

  const { data, total } = await privateCloudRequestsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );
  const rows = data.map(privateCloudRequestDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      headers={headers}
      rows={rows}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
