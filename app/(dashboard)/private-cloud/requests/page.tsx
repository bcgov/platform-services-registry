import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import { privateCloudRequestsPaginated } from '@/paginatedQueries/private-cloud';
import { privateCloudRequestDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrivateCloudRequest } from '@prisma/client';

export const revalidate = 0;

const headers = [
  { field: 'type', headerName: 'Type' },
  { field: 'status', headerName: 'Status' },
  { field: 'name', headerName: 'Name' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'cluster', headerName: 'Cluster' },
  { field: 'projectOwner', headerName: 'Project Owner' },
  { field: 'technicalLeads', headerName: 'Technical Leads' },
  { field: 'created', headerName: 'Created' },
  { field: 'licencePlate', headerName: 'Licence Plate' },
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
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log('No session found');
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const isAdmin = session?.user?.roles?.includes('admin');

  const { search, page, pageSize, ministry, cluster } = searchParams;

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  // If not an admin, we need to provide the user's email to the query
  const userEmail = isAdmin ? undefined : session?.user?.email;

  const { data, total }: { data: PrivateCloudRequest[]; total: number } = await privateCloudRequestsPaginated(
    defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster,
    userEmail,
    isAdmin,
  );

  const rows = data.map(privateCloudRequestDataToRow).reverse();

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
