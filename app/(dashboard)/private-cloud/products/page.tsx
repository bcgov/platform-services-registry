import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import { privateCloudProjectsPaginated } from '@/queries/paginated/private-cloud';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
// import checkUserMinistryRole from '@/components/utils/checkUserMinistryRole';

const headers = [
  { field: 'name', headerName: 'Name' },
  { field: 'description', headerName: 'Description' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'cluster', headerName: 'Cluster' },
  { field: 'projectOwner', headerName: 'Project Owner' },
  { field: 'technicalLeads', headerName: 'Technical Leads' },
  { field: 'created', headerName: 'Created' },
  { field: 'licencePlate', headerName: 'Licence Plate' },
  { field: 'edit', headerName: '' },
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
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log('No session found');
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const { search, page, pageSize, ministry, cluster } = searchParams;

  // const isAdmin = session?.user?.roles?.includes('admin');
  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;
  // const ministryRole = isAdmin ? null : checkUserMinistryRole(session?.user?.roles);
  // If not an admin or doesn't have ministry name role, we need to provide the user's email to the query
  // const userEmail = isAdmin || ministryRole ? undefined : session?.user?.email;

  const { data, total }: { data: PrivateProject[]; total: number } = await privateCloudProjectsPaginated(
    +pageSize || defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster,
    // userEmail
  );

  const rows = data.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
