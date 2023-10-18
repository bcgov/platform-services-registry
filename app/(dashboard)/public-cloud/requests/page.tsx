import Table from "@/components/table/Table";
import TableBody from "@/components/table/TableBody";
import { publicCloudRequestsPaginated } from "@/paginated-queries/private-cloud";
import { publicCloudRequestDataToRow } from "@/components/table/helpers/rowMapper";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const headers = [
  { field: "type", headerName: "Type" },
  { field: "status", headerName: "Status" },
  { field: "name", headerName: "Name" },
  { field: "ministry", headerName: "Ministry" },
  { field: "cluster", headerName: "Cluster" },
  { field: "projectOwner", headerName: "Project Owner" },
  { field: "technicalLeads", headerName: "Technical Leads" },
  { field: "created", headerName: "Created" },
  { field: "licencePlate", headerName: "Licence Plate" }
];

export default async function RequestsTable({
  searchParams
}: {
  searchParams: {
    search: string;
    page: number;
    pageSize: number;
    ministry: string;
    cluster: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("No session found");
    redirect("/login?callbackUrl=/private-cloud/products");
  }

  const { search, page, pageSize, ministry, cluster } = searchParams;

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === "string" ? +page : 1;
  const defaultPageSize = 10;

  // If not an admin, we need to provide the user's email to the query
  const userEmail = session?.user?.roles?.includes("admin")
    ? undefined
    : session?.user?.email;

  const { data, total } = await publicCloudRequestsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster,
    userEmail
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
