import Table from "@/components/table/Table";
import { publicCloudProjectsPaginated } from "@/queries/project";
import { publicCloudDataToRow } from "@/helpers/rowMapper";

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

  const { data, total } = await publicCloudProjectsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );

  const rows = data.map(publicCloudDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      headers={publicCloudHeaders}
      rows={rows}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
