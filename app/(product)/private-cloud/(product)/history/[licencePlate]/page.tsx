import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyRequests';
import { privateCloudRequestDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchActivePrivateCloudRequests } from '@/queries/private-cloud-requests';

export const revalidate = 0;

const headers = [
  { field: 'created', headerName: 'Date' },
  { field: 'name', headerName: 'Name' },
  { field: 'type', headerName: 'Type' },
  { field: 'status', headerName: 'Status' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'cluster', headerName: 'Cluster' },
  // { field: 'projectOwner', headerName: 'Project Owner' },
  // { field: 'technicalLeads', headerName: 'Technical Leads' },
  { field: 'licencePlate', headerName: 'Licence Plate' },
];

export default async function RequestsTable({
  params,
  searchParams,
}: {
  params: { licencePlate: string };
  searchParams: {
    search: string;
    page: string;
    pageSize: string;
    ministry: string;
    cluster: string;
    active: boolean;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const { docs, totalCount } = await searchActivePrivateCloudRequests({
    session,
    skip,
    take,
    ministry,
    cluster,
    search,
  });

  const rows = docs.map(privateCloudRequestDataToRow);

  return (
    <Table
      title={`Request history for ${params.licencePlate}`}
      description="These are the submitted requests for the Private Cloud OpenShift platform"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      removeSearch={true}
    />
  );
}
