import Table from "@/components/table/Table";
import { privateCloudProjectsPaginated } from "@/queries/project";
import { privateCloudDataToRow } from "@/helpers/rowMapper";

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

  const { data, total } = await privateCloudProjectsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );

  const rows = data.map(privateCloudDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      headers={privateCloudHeaders}
      rows={rows}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
