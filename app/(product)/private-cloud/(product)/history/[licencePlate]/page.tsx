import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyRequests';
import { privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';
import { privateCloudRequestDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { PrivateCloudRequest } from '@prisma/client';
import { userInfo } from '@/queries/user';

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
    page: number;
    pageSize: number;
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

  const { search, page, pageSize, ministry, cluster, active } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const { data, total }: { data: PrivateCloudRequest[]; total: number } = await privateCloudRequestsPaginated(
    +pageSize || defaultPageSize,
    currentPage,
    params.licencePlate,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
    active,
  );

  const rows = data.map(privateCloudRequestDataToRow);

  return (
    <Table
      title={`Request history for ${params.licencePlate}`}
      description="These are the submitted requests for the Private Cloud OpenShift platform"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={+pageSize || defaultPageSize}
      removeSearch={true}
    />
  );
}
