import Table from "@/components/table/Table";
import { publicCloudProjectsPaginated } from "@/queries/project";
import { publicCloudProjectDataToRow } from "@/helpers/rowMapper";

const headers = [
  { field: "name", headerName: "Name" },
  { field: "csp", headerName: "Csp" },
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

  const rows = data.map(publicCloudProjectDataToRow);

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
