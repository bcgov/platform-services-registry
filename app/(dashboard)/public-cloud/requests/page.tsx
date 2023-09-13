import Table from "@/components/table/Table";
import TableBody from "@/components/table/TableBody";
import { publicCloudRequestsPaginated } from "@/queries/project";
import { publicCloudRequestDataToRow } from "@/components/table/helpers/rowMapper";

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

export default async function RequestsTable({
  searchParams,
}: {
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

  const { data, total } = await publicCloudRequestsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster
  );
  const rows = data.map(publicCloudRequestDataToRow);

  return (
    <Table
      title="Requests for Public Cloud Landing Zones"
      description="These are the submitted requests for your products the Public Cloud Landing Zones"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
