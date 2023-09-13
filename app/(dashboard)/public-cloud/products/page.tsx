import Table from "@/components/table/Table";
import TableBody from "@/components/table/TableBody";
import { privateCloudProjectsPaginated, Project } from "@/queries/project";
import { privateCloudProjectDataToRow } from "@/components/table/helpers/rowMapper";

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

export default async function ProductsTable({
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

  const { data, total }: { data: Project[]; total: number } =
    await privateCloudProjectsPaginated(
      defaultPageSize,
      currentPage,
      search,
      ministry,
      cluster
    );

  const rows = data.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud Landing Zones"
      description="These are your products using the Public Cloud Landing Zones"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
