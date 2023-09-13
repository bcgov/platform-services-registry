import Table from "@/components/table/Table";
import TableBody from "@/components/table/TableBody";
import { privateCloudRequestsPaginated } from "@/queries/project";
import { privateCloudRequestDataToRow } from "@/components/table/helpers/rowMapper";

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
      title="Requests in Private Cloud OpenShift Platform"
      description="These are the submitted requests for the Private Cloud OpenShift platform"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
