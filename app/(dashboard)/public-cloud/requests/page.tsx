import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import { publicCloudRequestsPaginated } from '@/queries/paginated/public-cloud';
import { publicCloudRequestDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';

const headers = [
  { field: 'type', headerName: 'Type' },
  { field: 'status', headerName: 'Status' },
  { field: 'name', headerName: 'Name' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'csp', headerName: 'Cluster' },
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
    provider: string;
    active: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const { search, page, pageSize, ministry, provider, active } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.user.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  // If not an admin, we need to provide the user's email to the query

  const { data, total } = await publicCloudRequestsPaginated(
    +pageSize || defaultPageSize,
    currentPage,
    search,
    ministry,
    provider,
    userEmail,
    ministryRoles,
    JSON.parse(active || 'true'),
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
